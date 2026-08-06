# AI Builder Class — Skills

Working Claude Code skills from the AI Builder Class. These are not demos. They are the actual tools, with the traps already found so you don't have to find them the hard way.

**Class: Saturday, August 22.**

---

## What a skill is

A skill is a folder with a `SKILL.md` in it. Claude reads the description, decides when it applies, and follows the steps. You don't call it like a program. You say "run comps in propwire on 123 Main St" and it goes.

The value isn't the instructions. It's the **traps**. Every skill here carries the specific ways the tool lies to you, learned by getting it wrong first.

---

## Install

Drop the folders into your skills directory:

```bash
# macOS / Linux
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
```

Restart Claude Code. Type `/` and you should see them listed.

To confirm it took, ask Claude: *"what skills do you have for comps?"*

---

## What's in here

### `comps-propwire`

Comparable sales in **PropWire**, which is free, needs no credits, and covers all 50 states.

Traps it carries:

- **Most rows labeled "Sold" are not sales.** PropWire tags its own estimates with `/est` and puts them in the same table as real closings. On the run that built this skill, **24 of 26 were estimates.** Averaging those together gives you a confident, wrong number.
- **The value reads $0 until you tick the checkboxes.** Not a paywall. That's the workflow.
- **Widen distance and time, never tighten beds and baths.** Over-filtering makes an empty result that looks like a dead market.

### `comps-propelio`

Comparable sales in **Propelio**, for **non-disclosure states** (TX, TN, LA, MS, UT, ID, KS, AK, NM, ND, WY, MO, MT). In those states sale prices aren't public record, so the MLS feed is the only source and a public-records tool physically cannot help you.

Traps it carries:

- **Coverage is partial and it fails late.** The property record loads fine everywhere, then the comps tab tells you there's no coverage. Check the map first.
- **`app.propelio.com` is the dead legacy app.** Property pages render a blank white screen. Use `genesis.propelio.com`.
- **The results list mixes active listings with sales.** A "9 results" CMA can be nine stale listings and zero closings. The tell is the Sold summary reading all dashes.

---

## Requirements

| Skill | Account | Cost |
|---|---|---|
| `comps-propwire` | propwire.com | Free |
| `comps-propelio` | propelio.com | Paid |

Both drive a real browser, so you need browser automation connected to Claude (Claude in Chrome or equivalent) and you need to be logged into the tool already. Neither skill will ever try to log in for you.

---

## The pattern worth stealing

Every one of these follows the same shape, and it's the shape that transfers to whatever tool you use:

1. **Check coverage or capability first**, so you fail in ten seconds instead of ten minutes
2. **Start tight, widen one step at a time**, and report where you stopped, because how far you had to widen is itself information
3. **Separate hard data from estimates** and never let the estimates carry the conclusion
4. **Hand back something clickable**, so the human can check your work instead of trusting it
5. **Name the conflicts** between sources instead of picking a winner silently

A tool changes. That list doesn't.

---

## Fair use

These drive vendor interfaces at human pace using your own logged-in account. They are not scrapers and shouldn't be turned into scrapers. PropWire in particular runs bot detection, and hammering it gets your account challenged or blocked.

Undocumented endpoints change without notice. Don't build anything you'd be upset to have break.

---

*Questions during the class, or after: bring them to the group.*
