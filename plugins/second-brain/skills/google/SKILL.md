---
name: google
description: Read and act on the user's Google accounts (Gmail, Calendar, Drive, Sheets, Docs) through the `gws-as` command, one profile per account. Use when the user asks about their email, inbox, calendar, a Google Doc or Sheet, a file in Drive, or says "check my gmail", "what's on my calendar", "find that spreadsheet". Also covers connecting a new account when they say "connect my Google account" or /doctor says Google is not connected.
---

# Google accounts

The user's accounts are listed in their `CLAUDE.md` under "My Google
accounts", with a profile name for each. **The profile is the account.**
Never guess which one; if the instruction does not say, ask once, then
write the answer into that table so you never ask again.

## Using it

Every call is `gws-as <profile> <service> <resource> <method> --params '<json>'`.
Read-only calls need no permission. Anything that sends, creates, moves or
deletes follows the rules in their `CLAUDE.md`, which default to **show the
draft first**.

Say which account you used, in one line, every time.

```
gws-as mbj gmail users messages list --params '{"userId":"me","q":"from:someone newer_than:7d","maxResults":10}'
gws-as mbj gmail users messages get  --params '{"userId":"me","id":"<id>","format":"metadata","metadataHeaders":["From","Subject","Date"]}'
gws-as mbj calendar events list      --params '{"calendarId":"primary","timeMin":"2026-09-06T00:00:00-07:00","maxResults":10,"singleEvents":true,"orderBy":"startTime"}'
gws-as mbj drive files list          --params '{"q":"name contains \"invoice\"","pageSize":10,"fields":"files(id,name,mimeType,modifiedTime)"}'
gws-as mbj sheets spreadsheets values get --params '{"spreadsheetId":"<id>","range":"Sheet1!A1:F20"}'
gws-as mbj docs documents get        --params '{"documentId":"<id>"}'
gws schema gmail.users.messages.list        # any method's parameters, when unsure
```

Dates and times are in the user's time zone from `CLAUDE.md`. Gmail search
uses the same words as the Gmail search box.

## What you must not do

- Send, reply, or forward without showing the exact text and recipient first.
- Delete anything. Archive or label instead, and say so.
- Use a profile that is not in their table.

## Connecting an account (operator work, done at install)

Needs a Google Cloud project owned by the user's main account, with these
five APIs enabled: Gmail, Calendar, Drive, Sheets, Docs. Then, in Google Auth
Platform: Branding filled, Audience External, and **published to production**.
Four traps, each one cost an hour the first time:

1. **The "OAuth configuration is incomplete, see Branding" banner lies.** The
   real gate for Publish is three unstarred fields on Branding: application
   home page, privacy policy link (the same URL is fine), and an authorized
   domain. Fill those and Publish lights up.
2. **Testing status expires every token after seven days.** Publish. The
   unverified-app warning on first sign-in is the price, once per account.
3. **The CLI stores tokens in the macOS keychain by default,** which refuses
   any SSH session ("User interaction is not allowed"). `gws-as` sets the file
   backend. Never run `gws auth login` bare over SSH.
4. **A second account is a stranger to the project.** Its calls fail with
   "caller does not have required permission to use project" until that
   address is granted the **Service Usage Consumer** role in the project's IAM.

Then per account: `gws-as <profile> auth login -s gmail,calendar,drive`,
which prints a URL; `open` it in their Chrome, they pick the account and
consent, the token lands in `~/.config/gws-<profile>/`. Prove each service
with a read-only call before saying it works.
