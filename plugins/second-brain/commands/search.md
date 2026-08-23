---
description: Search your notes by meaning, not by exact words. Finds a note about underwater deals even if it never uses the word "underwater".
---

Search the user's vault semantically:

```
node "${CLAUDE_PLUGIN_ROOT}/lib/search.mjs" "<their question, in their words>"
```

Pass what they actually asked, not keywords you extracted from it. The whole
point of this tool is that it matches meaning, so stripping it down to nouns
makes it worse, not better.

Then:

1. Show them the files it found and say what is in each one, in a sentence.
2. Offer to open or summarize the most relevant one.

🚨 **If it prints NO INDEX YET, that is not an empty result.** It means nothing
has been indexed, which looks identical to "nothing matched" and means the
opposite. Say so plainly, then run:

```
node "${CLAUDE_PLUGIN_ROOT}/lib/search.mjs" --reindex
```

The first index takes a minute because it downloads a small model. Every one
after that is incremental and fast.

If the reindex says it cannot find `@huggingface/transformers`, tell them to run
`/setup` again. Do not try to install it yourself.
