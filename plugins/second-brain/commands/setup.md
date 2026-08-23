---
description: Set up your second brain for the first time. Creates your vault, turns on the daily check-in, and installs search. Safe to run again any time something seems broken.
---

Run the setup script for the user's second brain.

```
node "${CLAUDE_PLUGIN_ROOT}/lib/setup.mjs"
```

If the user named a folder in their message, pass it as the argument instead:

```
node "${CLAUDE_PLUGIN_ROOT}/lib/setup.mjs" "<their folder>"
```

Then:

1. Show them the output as it is. Do not summarize away a FAIL or a WARN.
2. If everything passed, tell them to restart Claude and come back, because
   hooks only load when a session starts.
3. If anything failed, read them the one line that failed and what to do about
   it. Do not offer a workaround you have not been given here, and do not start
   debugging their machine on your own. Tell them to send the screen to
   Christopher if the printed fix does not work.

Never edit their notes as part of setup.
