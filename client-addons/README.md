# Client add-ons

**Nothing in here ships.** The base install is general on purpose: a strong
second brain, no industry, no vendor, no assumptions about what somebody
does for a living.

Anything specific gets built for that one person at install time, because
two people in the same industry do not use the same software, and a pack
that guesses is worse than no pack. It puts skills on their machine that
name tools they do not have, which teaches them the system does not know
them.

## The pattern

At install, after the base is running and they have been through onboarding:

1. **Ask what they actually do**, in their words. Not their industry, their
   week. What arrives, what they do to it, what leaves.
2. **Ask what they use.** Names of the actual software. This is the part
   nobody can guess.
3. **Add folders for their real objects.** The base ships `projects/` and
   `people/`. Somebody in real estate needs `deals/` and `properties/`.
   Somebody running a shop needs `jobs/` and `crew/`. Name them after what
   they call them, not what the category is called.
4. **Add a template per object**, with `last_touched:` in the frontmatter so
   the maintenance layer has its signal.
5. **Add an intake skill** for whatever arrives messiest and most often.
6. **Add rules to their `CLAUDE.md`** for the things that cost money when
   done wrong in their work.

Only step 6 needs judgment. The rest is mechanical once you have the answers
from steps 1 and 2.

## What lives here

`example-real-estate-christopher/` is the layer for Christopher's own work,
kept as a worked example rather than a product. It shows the shape: extra
folders and templates, an intake skill for the object type, two skills that
drive specific comp tools, and a rules file of things learned the expensive
way.

Read it before building somebody else's. Do not install it on anyone. The
comp tools in it are Christopher's accounts, and the rules in it assume how
he runs deals.
