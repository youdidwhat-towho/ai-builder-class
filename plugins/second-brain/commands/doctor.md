---
description: Check whether your second brain is working. Run this any time something seems off, before asking anyone for help.
---

Run the checkup:

```
node "${CLAUDE_PLUGIN_ROOT}/lib/doctor.mjs"
```

Show the user the full output verbatim.

Then, if there are any FAIL or WARN lines, walk them through the printed fix
for the first one only. One thing at a time. Beginners abandon a list.

Do not invent fixes. Every check in that script prints its own instruction. If
the printed instruction does not work, tell them to copy the whole output and
send it to Christopher. That is the correct answer, not a guess.
