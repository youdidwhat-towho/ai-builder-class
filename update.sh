#!/usr/bin/env bash
# Updates your class skills. Safe to run any time, safe to run twice.
#
# Needs nothing installed. No GitHub account, no git, no login.
# It NEVER touches your vault. Your notes stay exactly as they are.
set -euo pipefail

ZIP="https://codeload.github.com/youdidwhat-towho/ai-builder-class/zip/refs/heads/main"
SKILLS="$HOME/.claude/skills"
CMDS="$HOME/.claude/commands"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading the latest kit..."
curl -fsSL -o "$TMP/kit.zip" "$ZIP"

echo "Unpacking..."
tar -xf "$TMP/kit.zip" -C "$TMP"
SRC="$TMP/ai-builder-class-main"

if [ ! -d "$SRC/claude-config/skills" ]; then
  echo "Something went wrong, the download does not look right. Nothing was changed."
  exit 1
fi

mkdir -p "$SKILLS" "$CMDS"
cp -R "$SRC/claude-config/skills/." "$SKILLS/"
cp -R "$SRC/claude-config/commands/." "$CMDS/"

echo
echo "Done. You now have these skills:"
ls -1 "$SKILLS"
echo
echo "Your vault was not touched."
echo "Now restart Claude Code, then type / to see them."
