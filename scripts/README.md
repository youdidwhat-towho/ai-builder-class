# Optional scripts

**These are not the documented way to update, and they are deliberately not linked
from anything students receive.**

The student path is the `update-kit` skill: say "update my class skills" to Claude,
or use the click-only route in `../UPDATE.md`.

## Why they are not the main path

Fake "install Claude" ads and pages are widespread, and the most common technique in
them is instructing the user to paste a command into PowerShell or Terminal. Teaching
a room of non-technical people to paste a handed-over command trains exactly the
reflex those attacks need, even when our command is fine. So the docs do not do that.

These stay here for someone comfortable in a terminal who would rather run one thing.

## Status

| Script | Platform | Verified |
|---|---|---|
| `update.sh` | macOS | **Yes.** Run end to end against a throwaway HOME, twice, against the live published URL |
| `update.ps1` | Windows 10/11 | **No.** Correct by inspection only. No Windows machine was available to run it |

`update.ps1` is hardened for the known Windows PowerShell 5.1 traps: it forces TLS
1.2 (older Windows 10 defaults to 1.0, which GitHub refuses, surfacing as a
confusing "could not create SSL/TLS secure channel"), silences the progress bar
(a 5.1 bug that turns a small download into minutes of apparent hanging), and traps
errors. It has still never actually been run. Treat it accordingly.

Neither script touches the vault. Both replace skills and commands only.
