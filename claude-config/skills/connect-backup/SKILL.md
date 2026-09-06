---
name: connect-backup
description: Connect the vault's nightly backup to a private online copy on GitHub. Use when the user says "connect my backup", "back up my vault online", "set up GitHub", "the morning note says my notes are only on this laptop", or /doctor says the backup is saved on this machine only.
---

# Connect the backup

The nightly backup already commits the vault every night at 10:20. Without
an online copy, that history lives on one disk. This connects it to a
private GitHub repository. About five minutes, and you do the work; they
only type one code.

## What they need first

A free GitHub account, created by them at github.com. Ask for the username.
That is the only thing they have to do at their keyboard before you start.

## Steps

1. **Is `gh` installed?** Run `gh --version`. If missing:
   - Mac: download the `macOS_arm64` (Apple silicon) or `macOS_amd64` zip
     from `https://github.com/cli/cli/releases/latest`, unzip, put `bin/gh`
     at `~/.local/bin/gh`. No Homebrew, no sudo.
   - Windows: `winget install GitHub.cli`, then have them restart the terminal.
2. **Log in with a one-time code.** Run
   `gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key`.
   It prints a code like `ABCD-1234` and a link. Put both in front of them:
   they open the link, type the code, click Authorize. Wait for
   `gh auth status` to say logged in.
3. **Let git use the login.** `gh auth setup-git`.
4. **Give commits a name.** In the vault: `git config user.name "<their name>"`
   and `git config user.email "<username>@users.noreply.github.com"`. The
   no-reply address keeps their real email out of the history.
5. **Create the private repository and push.** From inside the vault:
   `gh repo create second-brain --private --source=. --remote=origin --push`.
   If the vault is not a git repo yet, run the backup once first
   (`node <plugin>/hooks/backup.mjs`), which creates one.
6. **Prove it, do not assume it.**
   - `gh repo view --json isPrivate` must say `true`. If it does not, stop
     and fix that before anything else.
   - Run the backup once by hand and read what it prints.
   - `git ls-remote origin main` against `git rev-parse HEAD`: the push is
     proven when the two hashes match.
7. **Tell them what they now have** in one sentence: every night at 10:20
   their notes are copied to a private page only they can see, and the
   morning note will say so.

## What never goes in the repo

The machine-local state files are ignored by the vault's `.gitignore` and
the backup repairs that file if it is missing. Do not add anything else to
the repository by hand. The nightly job owns it.

## If it fails later

The morning note will say "last night's backup did not reach the online
copy" and `/doctor` prints the reason. Login or permission reasons mean
step 2 again. Network reasons fix themselves the next night.
