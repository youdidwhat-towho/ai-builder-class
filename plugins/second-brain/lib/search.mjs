// Semantic search over the vault. No server, no database, no Docker.
//
// Why this exists: Medin's reference build gets vector search from Postgres
// with pgvector in a container. That is the right call for his audience and
// the wrong one for five real estate agents, because it means Docker Desktop
// has to be installed and running before their notes are searchable.
//
// This does the same job with a small embedding model running inside Node
// and the index as one file in their vault. Measured on an M-series Mac:
// ~2.6ms to embed a note, ~2ms to run a query against a few thousand of
// them. pgvector wins in the tens of thousands, which is years away for a
// student who has zero notes today.
//
// It ships indexed on install so there is no "later" for them to miss.

import fs from "node:fs";
import path from "node:path";

const MODEL = "Xenova/all-MiniLM-L6-v2";
const INDEX_NAME = ".search-index.json";

// Chunking: notes are split so a long daily note does not average itself
// into meaninglessness. Small enough to be specific, big enough to carry
// context.
const CHUNK_CHARS = 900;
const CHUNK_OVERLAP = 150;

let _extractor = null;

/**
 * Load the embedding model. First call downloads it (~90MB) and caches it
 * under the user's home directory; every call after is local and offline.
 */
async function extractor() {
  if (_extractor) return _extractor;
  const { pipeline } = await import("@huggingface/transformers");
  _extractor = await pipeline("feature-extraction", MODEL, { dtype: "fp32" });
  return _extractor;
}

export async function embed(text) {
  const ex = await extractor();
  const out = await ex(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

/** Vectors are normalized at embed time, so the dot product is the cosine. */
function similarity(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function chunk(text) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= CHUNK_CHARS) return clean ? [clean] : [];
  const parts = [];
  let i = 0;
  while (i < clean.length) {
    parts.push(clean.slice(i, i + CHUNK_CHARS));
    i += CHUNK_CHARS - CHUNK_OVERLAP;
  }
  return parts;
}

/**
 * Template scaffolding, not the student's writing.
 *
 * Indexing these put "properties/README.md" in the top results for a real
 * question, which makes search look broken on day one when those files are
 * most of the vault.
 */
function isScaffolding(name) {
  const n = name.toLowerCase();
  return n === "readme.md" || n === "bootstrap.md";
}

/** Every markdown file in the vault, skipping machinery and archives. */
function vaultFiles(vault) {
  const skip = new Set([".git", ".obsidian", "node_modules", "archive", ".trash"]);
  const found = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".") && e.name !== ".") {
        if (skip.has(e.name)) continue;
        if (e.isDirectory()) continue;
      }
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!skip.has(e.name)) walk(full);
      } else if (e.name.endsWith(".md") && !isScaffolding(e.name)) {
        found.push(full);
      }
    }
  };
  walk(vault);
  return found;
}

export function indexPath(vault) {
  return path.join(vault, INDEX_NAME);
}

export function loadIndex(vault) {
  try {
    return JSON.parse(fs.readFileSync(indexPath(vault), "utf8"));
  } catch {
    return { model: MODEL, entries: [] };
  }
}

/**
 * Build or refresh the index.
 *
 * Incremental by mtime: only files that changed since the last run get
 * re-embedded. A nightly full re-index of a large vault would be wasted
 * work and would make the reflection job feel like it hung.
 */
export async function reindex(vault, { onProgress } = {}) {
  const existing = loadIndex(vault);
  const byFile = new Map();
  for (const e of existing.entries || []) {
    if (!byFile.has(e.file)) byFile.set(e.file, []);
    byFile.get(e.file).push(e);
  }

  const files = vaultFiles(vault);
  const fresh = [];
  let embedded = 0;
  let reused = 0;

  for (const file of files) {
    const rel = path.relative(vault, file);
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      continue;
    }

    const prior = byFile.get(rel);
    if (prior && prior.length && prior[0].mtime === stat.mtimeMs) {
      fresh.push(...prior);
      reused += prior.length;
      continue;
    }

    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    for (const piece of chunk(text)) {
      const vec = await embed(piece);
      fresh.push({
        file: rel,
        mtime: stat.mtimeMs,
        text: piece.slice(0, 400),
        vec,
      });
      embedded++;
      if (onProgress && embedded % 25 === 0) onProgress(embedded);
    }
  }

  const index = { model: MODEL, built: new Date().toISOString(), entries: fresh };
  fs.writeFileSync(indexPath(vault), JSON.stringify(index), "utf8");
  return { embedded, reused, files: files.length, chunks: fresh.length };
}

/** Semantic search. Returns the best chunks, best first. */
export async function search(vault, query, limit = 5) {
  const index = loadIndex(vault);
  if (!index.entries.length) {
    return { error: "Index is empty. Run the reindex first." };
  }
  const qv = await embed(query);
  const scored = index.entries
    .map((e) => ({ ...e, score: similarity(qv, e.vec) }))
    .sort((a, b) => b.score - a.score);

  // One hit per file. Five chunks of the same daily note is not five results.
  const seen = new Set();
  const hits = [];
  for (const s of scored) {
    if (seen.has(s.file)) continue;
    seen.add(s.file);
    hits.push({ file: s.file, score: s.score, text: s.text });
    if (hits.length >= limit) break;
  }
  return { hits };
}
