---
name: second-brain-onboarding
description: Interview the user about themselves and their business, then write the answers into their vault so Claude actually knows who it is working for. Use when the user says "set up my second brain", "onboard me", "get to know me", "let's set this up", "who am I", when they are new to the vault, or when CLAUDE.md still has blank lines under "Who I am". This is the first thing a new vault should do.
---

# Second brain onboarding

The gap between a chatbot and a second brain is that a second brain knows things
about the person that were never written down anywhere. This interview is how it
learns them, and it is the first thing a new vault should run.

## Before you start

Read `CLAUDE.md` and `MEMORY.md` in the vault first, if you have not already this
session. Do not assume they were loaded for you. Some surfaces load `CLAUDE.md`
automatically and some do not, and an interview that ignores rules the user already
wrote is worse than no interview.

## The rules of the interview

1. **One question at a time.** Never send a wall of questions. A list of twelve
   questions gets abandoned; one question gets answered.
2. **Conversational, not a form.** React to what they said before asking the next
   thing. If an answer opens something interesting, follow it.
3. **Short questions.** One or two lines. They are typing on a Saturday.
4. **Never ask for anything sensitive.** No SSN, no account numbers, no passwords,
   no client financial details. If they volunteer something sensitive, do not write
   it to the vault, and say why.
5. **Skipping is allowed.** "Skip" moves on. A blank is better than a made-up answer.
6. **Fifteen minutes, not an hour.** Get the spine, not the biography. The vault
   fills in over time.

## What to ask

Work down these six areas. Adapt the wording to how they talk. Ask follow-ups when
an answer is thin, but do not interrogate.

### 1. Who they are
Name. What they actually do day to day, in their words. How long they have been at
it. Where they operate, by city, state, or market.

### 2. The business
What kinds of deals they do. Wholesale, flip, novation, listings, rentals, lending,
whatever they name. Which one actually pays the bills right now versus which one
they talk about. Solo, or is there a team, and who does what.

### 3. How money comes in
Where deals come from today, in order of how many. Cold calls, direct mail, PPC,
agents, referrals, a JV partner, a list source. What a typical month looks like in
volume, not dollars, unless they offer dollars.

### 4. The tools they already run
CRM, list tool, dialer, comps tool, spreadsheets, whatever it is. **Ask what they
actually open every day, not what they pay for.** Those are different lists and the
difference matters.

### 5. The thing they would pay to never do again
Ask this one directly and then be quiet. This is the most valuable answer in the
whole interview. Follow up once: how many hours a week, and what happens when it
does not get done.

### 6. How they want to be talked to
Do they want the short version or the reasoning. Do they want to be taught as you
go or just handed the answer. Are there words they hate.

## Then write it down

**An interview that does not write anything is just a conversation.** When they are
done, write to these files, then tell them exactly what you wrote and where.

**`CLAUDE.md`**. Fill in the four lines under "Who I am". Then add what you learned
about how they work as new numbered items under "Rules". Keep it tight, a few lines
each. Do not paste the transcript in. This file has to stay short to stay effective.

**`MEMORY.md`**. Put what they are working on right now under the first heading, and
anything they are waiting on under the second.

**`operations/`**. If they described a process they run repeatedly, write it as a
checklist in its own file, named for the job.

**`reference/my-tools.md`**. The tool list from area 4, split into "open daily" and
"pay for but rarely open". That second list is usually a surprise to them.

**`daily/<today>.md`**. Append a short note that onboarding ran and what came out
of it, so the trail starts on day one.

## Prove it worked

Do not end by saying "you're all set up." Show them. Ask a question back that you
could only answer now, using something specific they told you. Something like:

> Based on what you told me, the thing eating your week is [their answer to #5], and
> it is happening inside [their tool from #4]. Want to point tomorrow at that?

If you cannot form that sentence from what you wrote down, the interview was too
shallow. Go back and ask about area 5 again.

## Then get out of the way

End by telling them the one habit that matters: everything goes in `daily/` first,
messy, no decisions. Then ask them for one real thing from their week and put it in.
