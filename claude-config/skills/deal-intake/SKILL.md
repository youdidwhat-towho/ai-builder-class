---
name: deal-intake
description: Turn a messy paste, a forwarded email, a text thread, or a set of numbers into a structured deal file in deals/. Use when the user says "new deal", "add this deal", "here's a lead", "underwrite this", "make a deal card", or pastes property details in any shape.
---

# Deal intake

Take whatever shape it arrives in and produce one clean deal file. The user should
never have to format anything.

## Steps

1. **Check for an existing file first.** Search `deals/` and `properties/` for the
   address. If it exists, append to it. Never create a second file for the same
   property, and never silently overwrite one.
2. **Extract what is actually there.** Address, asking price, condition, beds and
   baths, square footage, seller name and contact, motivation, timeline, source.
3. **Leave blanks blank.** Do not write "TBD" or "unknown" in every empty field.
   An empty field reads as empty. A field full of TBD reads as noise. Put the
   things you still need in one short checklist at the top instead.
4. **Never invent a number.** Not an ARV, not a repair estimate, not a comp. If
   they did not give it to you and you did not look it up, it is not in the file.
5. **Write the file** to `deals/<street-address-slug>.md` using `_templates/deal.md`.
6. **Append a line to today's daily note** saying the deal came in and where it went.

## The part people miss

Write down **why the seller is selling and what they said in their own words**, if
it is anywhere in the source. That single line is worth more later than every
number in the file, and it is the first thing that gets lost when someone
"cleans up" a lead into a form.
