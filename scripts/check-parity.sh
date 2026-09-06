#!/usr/bin/env bash
# Are the two halves of this kit still the same kit?
#
# This repo installs two ways. The plugin is what most people actually get;
# claude-config is what the README tells them to copy. When those two drift,
# somebody gets a version of the kit nobody tested, and nothing anywhere says
# so. That is exactly how two clients ended up running a second brain with its
# instructions stripped out for three weeks.
#
# The plugin is canonical. This script says what claude-config is missing or
# carrying that the plugin is not, and refuses to pass when they differ.
#
# Run it before every release, and after any change to skills or commands.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

PLUGIN="plugins/second-brain"
fail=0

say() { printf '%s\n' "$*"; }

say ""
say "  KIT PARITY CHECK"
say "  ----------------------------------------------------"

# 1. Skills: identical trees, byte for byte.
if diff -rq "claude-config/skills" "$PLUGIN/skills" >/tmp/parity.$$ 2>&1; then
  n=$(find "$PLUGIN/skills" -name SKILL.md | wc -l | tr -d ' ')
  say "  [  OK  ] Skills: $n, identical in both halves"
else
  say "  [ FAIL ] Skills differ between the two install paths:"
  sed 's/^/            /' /tmp/parity.$$
  say "            Fix:  rm -rf claude-config/skills && cp -R $PLUGIN/skills claude-config/skills"
  fail=1
fi
rm -f /tmp/parity.$$

# 2. Commands: every command claude-config ships must exist in the plugin.
#    The reverse is allowed, since doctor/search/setup need the plugin runtime.
missing=""
for f in claude-config/commands/*.md; do
  [ -e "$f" ] || continue
  b=$(basename "$f")
  [ -f "$PLUGIN/commands/$b" ] || missing="$missing $b"
done
if [ -z "$missing" ]; then
  say "  [  OK  ] Commands: everything in claude-config also ships in the plugin"
else
  say "  [ FAIL ] In claude-config but NOT in the plugin:$missing"
  say "            Anyone who installed the plugin does not have these, and the"
  say "            client guides may already promise them."
  fail=1
fi

# 3. The base install stays general. Industry and vendor words belong in
#    client-addons/, which is built per person and never shipped.
leaks=$(grep -rilE '\b(propwire|propelio|arv|wholesal|escrow|realtor|appraiser|comps)\b' \
          "$PLUGIN/vault-template" "$PLUGIN/skills" "$PLUGIN/commands" claude-config 2>/dev/null || true)
if [ -z "$leaks" ]; then
  say "  [  OK  ] Base install: no industry or vendor language"
else
  say "  [ FAIL ] Industry or vendor language leaked into the base install:"
  printf '            %s\n' $leaks
  say "            That belongs in client-addons/, built per person at install."
  fail=1
fi

# 4. The vault template has to SAY something. Presence is not substance, and
#    substance is the only part anybody actually bought.
# Phrases must be short enough to survive line wrapping in the markdown.
promises="capture door|which file|by meaning|Empty and blocked|last_touched|archive|maintain|week-review"
claude="$PLUGIN/vault-template/CLAUDE.md"
missing_rules=""
IFS='|'
for rule in $promises; do
  grep -qi -- "$rule" "$claude" 2>/dev/null || missing_rules="$missing_rules $rule"
done
unset IFS
if [ -z "$missing_rules" ]; then
  say "  [  OK  ] Vault contract: all 8 rules present in CLAUDE.md"
else
  say "  [ FAIL ] Vault CLAUDE.md is missing:$missing_rules"
  say "            This is the hollow-kit failure. It installs fine and says nothing."
  fail=1
fi

say ""
if [ "$fail" -eq 0 ]; then
  say "  Both halves ship the same kit."
  say ""
  exit 0
fi
say "  Do not release until the above is clean."
say ""
exit 1
