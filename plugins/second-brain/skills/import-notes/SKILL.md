---
name: import-notes
description: Bring what another tool remembered into the vault. Google Keep notes and Gemini chat history from a Google Takeout export, converted to dated markdown under reference/, then a distillation pass that writes the durable facts where they belong. Use when the user says "import my Keep notes", "bring in my Gemini history", "I downloaded my Takeout", "here is the zip from Google", or drops a Takeout zip or folder.
---

# Import notes

Two steps. The first is a script and takes seconds. The second is a
conversation and is the part that makes it worth doing.

## Step 1: get the export in

They need a Google Takeout export. If they do not have one yet, this is the
whole instruction, and it has to be them, signed in to the account that
holds the notes:

1. Go to takeout.google.com.
2. **Deselect all.** Then tick only **Keep** and **My Activity**.
3. Under My Activity, click "All activity data included", deselect all, tick
   only **Gemini Apps**. Then click "Multiple formats" and change Activity
   records from HTML to **JSON**. This is the step everyone misses.
4. Create export. Google emails a zip within a few hours. The link lasts
   seven days.

One export per Google account. If they use Keep or Gemini in more than one
account, they do it once per account.

If they chose **Add to Drive** on the Takeout page (the better choice: the
link in the email dies in seven days, the Drive copy does not), the zip is in
a folder called Takeout in that account's Drive. Pull it down yourself, no
clicks on their side:

```
gws-as <profile> drive files list --params '{"q":"name contains \"takeout\" and mimeType=\"application/zip\"","orderBy":"createdTime desc","fields":"files(id,name,size,createdTime)"}'
gws-as <profile> drive files get --params '{"fileId":"<id>","alt":"media"}' --output ~/Downloads/<name>
```

A big export arrives as several zips named -001, -002 and so on. Pull them
all and run the importer on each; it never overwrites, so order does not
matter.

When the zip is on the machine:

```
node "<plugin>/lib/import.mjs" "<path to zip or unzipped folder>"
```

It writes one markdown file per Keep note under `reference/keep/` and one
file per day of Gemini history under `reference/gemini/`, with a stamp on
each. Trashed notes are skipped. Shared notes carry who they are shared with.
It never overwrites, so a fresh export next quarter only adds what is new.
Read the one line it prints and repeat it to them in plain words.

## Step 2: distill

The archive is the source. It is searchable the next night. But nobody
should have to search their own life to know what they think, so read it
once and pull out what is durable:

- **Facts about them and their business** that are not already in
  `CLAUDE.md` under "Who I am." Properties, entities, people, tools, the
  way they price things, the way they say things.
- **Projects that kept coming up** across many days. One note each in
  `projects/`, with what it is, where it stood at the last mention, and
  the date of that mention. Stamp them.
- **People** who appear more than twice. One note each in `people/`.
- **Decisions they made** in the history. Into `decisions/`, dated.
- **Standing lists** from Keep that are still live (a running to-do, a
  vendor list). Say where each one now lives.

Tell them what you found in a short list, then do the writing. Do not ask
permission per file; ask once at the start whether to go ahead, then go.

## What not to do

- Do not move or delete anything in `reference/`. It is the capture layer.
- Do not copy Gemini's answers into the vault as facts. What they *asked* is
  the signal. What Gemini *replied* is one model's guess on that day.
- Do not import shared household lists as business projects. A Keep note
  shared with a spouse is theirs together; leave it in `reference/keep/`
  and leave it alone.

## Afterward, the habit

Keep can stay for what it is good at: shared lists with the people they
live with. Everything else they would once have typed into Keep or asked
Gemini now goes through the one capture door. Say that once, plainly, and
offer to re-import Keep every few months so nothing is lost while the
habit moves.
