---
name: the-algorithm
description: Run the five-step Algorithm (question every requirement, delete, simplify and optimize, accelerate, automate last) against a plan, a build, a system, a process, or a council's recommendations, and return a short survivor list instead of a long shopping list. Steps 1 to 4 get the rigor; step 5 never blocks automating what is already known. Use when the user says "the algorithm", "run the algorithm on X", "delete pass", "what can we cut", "this feels bloated", "simplify this plan", or before committing to any build, automation, or cleanup. The council skill runs it after any council that recommends building something.
---

# The Algorithm

The five steps come from Elon Musk. The way to actually run them comes from Jon
McNeill's book *The Algorithm* (he was president of Tesla 2015 to 2018). Page
numbers below are from that book. A few tools are Musk's own and are labeled
**(Musk)**. Rules this kit adds are labeled **(kit)**.

Councils add. The Algorithm subtracts. Its output is a shorter thing, not a new
document.

## The message, before the mechanics

McNeill's point (Intro, pp 19-22): the breakthroughs came from people **chasing
stretch goals with free license to question everything**. The five steps are the
how. Three cultural ingredients make them stick (p143). So every run carries:

- **A stretch goal.** Set the outrageous version of the goal on purpose, without
  knowing how yet, so every assumption has to come into the open (p51). Ask: what
  is the outrageous version here?
- **Urgency.** Speed is the default, not a reward for being careful (p51).
- **Freedom to fail.** Some bold bets are supposed to come up short. That is how
  you know you pushed far enough (pp 35-36). Back people when a bet goes wrong
  (p63).

**The steps overlap.** Run them in order as a checklist, but do not refuse a good
move because it "belongs" to a later step (p53).

## Target

Takes a target: a plan, a spec, a process, a system, a list of recommendations.
If none was named, ask in one line and stop.

## Before step 1: write down what "done right" looks like

You can only question a requirement against a picture of the goal. Without that
picture you question it against how things are used today, and how things are
used today is often the very thing being fixed. Write three short things first:

1. **The goal, in the user's own words.** Quote them. Do not paraphrase it into a
   feature. If the target came out of a council, take the quotes from its brief.
2. **How the thing is designed to be used.** The tool's own training and docs,
   the user's standing rules, the required fields and steps. That is the
   "should". Live data is the "is".
3. **What the user has said must exist going forward.** Nothing on this list can
   be cut. The run may only simplify how it gets done.

If 1 is missing, ask in one line. If 2 exists in the vault or the tool's docs,
read it, do not ask.

## Step 1: Question every requirement

List every requirement, rule, custom and step, including the ones you stopped
noticing (p48). Step 2 cuts from this list.

For each, name the **person** who asked for it **(Musk)**. 🚨 **Claude is a valid
name and usually a frequent one.** Requirements Claude added while being helpful
are the highest-yield deletions. Audit your own contributions first and say so.

Keep asking why until you hit a floor: something true about the work you can
state and check, or "because so-and-so said so". "We have always done it this
way" is not a floor **(Musk)**.

McNeill's tests:
- **Rules can be changed, and sometimes defied (p27).** Sort each into law,
  recommendation, custom, or convention. Even "law" and "physics" get questioned:
  it is "all too easy to use physics as an excuse" (pp 29-31).
- **A danger claim needs data (pp 29-30).** Take it seriously and ask for the
  evidence in the same breath.
- **"Impossible" usually means unsolved (pp 37-41).** Bring in smart outsiders.
- **One-size-fits-all is a tell (pp 41-48).** Any rule that applies to everyone
  gets questioned.
- **Run the cheap experiment.** An experiment beats a debate (pp 35-36).

Output a table: requirement, who named it, bin, survives yes or no.

## Step 2: Delete every possible step

1. **Whoever owns it lists every step and says what each one accomplishes** (p51).
   That alone removes some.
2. **Circle every step the customer does not pay for** (p52). The customer may be
   the user, a teammate, or their actual customer.
3. **Aim for 80 percent cuts.** About 10 percent comes back, and going a bit too
   far is how you find the limit (p52). Name the item most likely to come back, so
   restoring it reads as the method working.
4. **Ask why the bloat survived.** Usually because people "judged it a risk to
   remove" (p57). Fear of removal, not function. Find out what is actually
   required, line by line.
5. **Persist.** The first several "no"s are normal (p57).

Musk's maturity guard **(Musk)**: "the thing this serves does not exist yet" is
not a reason to delete. The test is function and ownership.

**Unused is not the same as unneeded (kit).** "Nobody uses it" and "it's always
empty" are observations, not reasons to cut. In anything being cleaned up, empty
is often the symptom. A field that should be filled on every record and is filled
on almost none is usually being skipped, not unneeded. Before cutting anything on
usage alone, label it, checked against "done right":

| Label | Means | What the run does |
|---|---|---|
| **Dead** | Nobody needs it, and nothing in the goal, the design or the user's rules says anyone should | Cut |
| **Duplicate** | Already done somewhere else (say where) | Cut, and say where it lives |
| **Gap** | It should be used and is not: nobody fills it, nobody owns it, or it is too hard | **Never cut.** Step 3's job: make it filled by default, automatic, or owned |
| **Unknown** | You cannot tell which | Ask the user one line before cutting |

The 80 percent target counts only Dead and Duplicate. Keeping a Gap is not
timidity. It is the method finding the real job.

Output: the survivor list, numbered.

## Step 3: Simplify and optimize

Both halves.

- **Simplify:** can three things be one? Thirty days of training became one
  sentence, "Be so great that they'll talk about you at dinner" (pp 73-76). One
  radical cut leads to the next.
- **Optimize:** economy of movement, break work into small pieces, staff by how
  long each piece takes (pp 81-85). Numbers and stretch targets are fine here.
- **"Relentless pursuit of better. Not best"** (p76). Ship the better version now.
- Agree on the words people use before you count anything.

## Step 4: Accelerate cycle time

- **Measure the whole cycle end to end, then the hands-on time inside it** (pp
  89-91). The gap is the target.
- **Attack the waits, do not accept them.** A step went from 18 days to 18 hours
  (p91). Where a wait truly cannot shrink, start it on the earliest possible day.
- **Speed exposes quality problems, and fixing them raises quality** (pp 89, 107).
- **Keep the practices that keep people safe, break the rest** (pp 99-100).
- **Ship the tool before it is finished** (pp 95-97).
- One decision maker, a small team, someone senior clearing blockers (p105).

## Step 5: Automate last

The readiness test: **do we know every motion, route and interval** (pp 115-117)?
The reason is knowledge, not cost.

- **If you already know, automate now (kit).** Step 5 never blocks automating
  something the user has already run by hand and tested. Claude doing the work
  as an assistant is not "automation" in this sense and can happen at any step.
- **If you do not know, learn by hand, fast.** Days to a few weeks, with a dated
  review set on day one (pp 116-118).
- **The end state is automation.** Hand work is the school, not the destination.
- Make it visible before you make it software (pp 117-123). But do not hold the
  tool back chasing perfect either.
- Sunset date **(Musk)**: give every new scheduled job a review-by date, so
  removing it is the default.

## The three cultural ingredients, part of every run

1. **Urgency and accountability** (ch 8). A firm goal with a deadline, clear
   owners, and the leader visibly in it (pp 161-167).
2. **The whole customer experience is the product** (ch 7). Pain anywhere in it
   is an idea (pp 153-156).
3. **Use it yourself, often** (ch 9). Use it the way a customer would (p179). Ask:
   if you ran this, what would you change?

## Companion tools

- **Attack the constraint.** A process goes no faster than its slowest step
  (pp 31-34). Name the bottleneck in one sentence and say whether this work
  touches it. Then ask **(Musk)**: is this a "will" problem or a "way" problem?
  Suspect "will" first.
- **Idiot index (Musk).** Finished cost divided by raw input cost. A high ratio
  means the design is broken.
- **Thinking in limits (Musk).** Push the variable to absurd in both directions.
- **Radical rethinking** (ch 6). Running all five steps often leads to one
  (p140).

## Safety gates (kit)

- 🚨 **No deletion pass on contracts, money held for others, legal disclosures,
  licensing, or anything that keeps people safe.** Question them freely, delete
  nothing. McNeill's own version: keep the practices that keep people safe
  (pp 99-100).
- **Other companies' software stays surgical.** In a tool someone else built and
  runs for you, make small additive changes. Never delete records to "simplify".
- **Acting without asking:** three fast questions, will it hurt anyone, is it
  illegal, will it cost a fortune (pp 57-64). A quick judgment, not a permission
  form.

## Output rules

- **No new document.** Give the verdict in chat, then offer to cut the actual
  target. When the council skill called this, the verdict goes into that council's
  session file instead.
- **Lead with the survivor list,** then the stretch goal, the bottleneck, and the
  culture checks. Keep the reasoning short. A bloated deletion pass refutes
  itself.
- **Mark each survivor slow or fast, by one test: can it be undone (kit)?** Cannot
  be undone (money, contracts, messages sent to customers, deleting data) = slow
  and careful. Can be undone (wording, internal pages, settings) = fast, better
  not best.
- **Every cut carries its label and its reason on the same line** (Dead or
  Duplicate, plus the one-line why, or "lives in X"). Then a wrong cut is visible
  in seconds.
- Write the way McNeill writes: urgent, bold, plain. Recommend the bold move and
  name its risk once.
- If the run changes a vault file, log it the way the vault's CLAUDE.md says to
  log changes.

## Related

- `council` when the question is which direction to go. This skill is for when the
  plan got fat.
