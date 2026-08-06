---
name: comps-propwire
description: Run a comparable sales analysis in PropWire (propwire.com), the free nationwide property-data tool. Works in every state. Use when the user says "run comps in propwire", "/comps-propwire", "propwire this address", or "comp this in propwire". Carries the /est trap (most "Sold" rows are estimates, not recorded sales), the must-check-the-boxes mechanic that computes Comp-Based Value, and the requirement to hand back a clickable comp set rather than a wall of text.
---

# Comps in PropWire

PropWire is free, needs no credits, and covers the whole country. That makes it the default when you don't have MLS access or your paid comp tool has no coverage in that state.

The tradeoff is data quality. **PropWire's comp table mixes real recorded sales with its own estimates and labels both "Sold."** Reading that wrong is the single way this skill produces a bad number.

**You need:** a free PropWire account, logged in, and a browser-automation tool (Claude in Chrome or similar).

---

## The one rule about output

The point of a visual comp tool is to *see* the comps. A summary table in chat is not the deliverable.

**Every run must hand back:**

1. A **screenshot of the comp table**
2. **A clickable PropWire link for every comp**, so the user can open any row and check the work
3. The analysis on top of that, not instead of it

If they can't click into it, the run isn't finished.

---

## Step 1: Find the property

`https://propwire.com/search` → type the full address in the top-left search box → click the autocomplete row under **Places**.

URL shape:

```
https://propwire.com/realestate/{Address-Slug}/{id}/property-details
https://propwire.com/realestate/{Address-Slug}/{id}/comparable-sales
```

Individual comps use a shorter form with no trailing segment:
`https://propwire.com/realestate/123-Example-Rd/20491348`

Read the record with a page-text extraction rather than screenshots. It is comprehensive and far cheaper. PropWire returns building style, construction material, exterior type, roof, porch area, cooling type, heating fuel, **water source, sewage type**, zoning, APN, assessed values, and the tax bill.

## Step 2: Run the comps

Click the **Comps** tab (`/comparable-sales`). Three controls sit above the table:

| Control | Default |
|---|---|
| Status chip | `Sold` |
| Time window | `Sold in Last Year` |
| Distance | `Within 0.5 Mile` |
| `More` | extra filters, 1 applied by default |

### Widening sequence

**Move distance and time. Leave beds, baths, and sqft alone.** Over-filtering manufactures a false negative that reads like a market signal: you conclude "this market is dead" when you actually just asked an impossible question.

| Step | Distance | Sold within |
|---|---|---|
| 1 | 0.5 mile | 1 year |
| 2 | 1 mile | 1 year |
| 3 | 1 mile | 2 years |
| 4 | 2 miles | 2 years |
| 5 | 2 miles | 5 years |

Rural subjects need step 2 or 3 immediately. On a rural test subject (0.92 acre, farmland zoning) the 0.5-mile default returned **zero comps**. One mile returned 10. One mile over two years returned 26.

**Stop at the first step that yields a usable set**, and report which step you stopped at. How far you had to widen *is* information about the market.

## Step 3: 🚨 The `/est` trap

**Most rows marked "Sold" are not sales.** PropWire appends `/est` to the price when the number is its own estimate rather than a recorded transaction.

```
$261,590/est   ← PropWire's estimate. NOT a sale price.
$290,000       ← actual recorded sale
```

On the test run, **24 of 26 "Sold" comps were `/est`.** Only two were real.

Split them every time and say so:

- **Real sales carry the analysis.** These are what a seller, buyer, or appraiser can be shown.
- **`/est` rows are context only.** They are automated valuations sitting in a comp table. Never put them in correspondence, an offer, or anything a counterparty will rely on.

If a run produces fewer than three real sales, **say that out loud as the finding** rather than quietly averaging estimates into a number that looks authoritative.

## Step 4: 🚨 Check the boxes or you get zero

`Comp-Based Value` and `Avg. Price/SqFt` at the bottom left read **$0** until comps are selected. This is not a paywall and not a bug.

**Tick the header checkbox to select the whole page, or tick individual rows.** Both figures compute live off the selection and update as rows are added or removed.

That is the tool's real workflow: select the comps you actually believe, then read the number. On the test run, selecting all 26 gave **$282,240 / $196 per sqft** — but that included a $4,040 junk row and a 3,078 sqft outlier, so the honest move is to deselect the garbage and re-read.

## Step 5: Build the clickable set

Pull every comp link out of the page in one call:

```js
[...document.querySelectorAll('a[href*="/realestate/"]')]
  .map(a => ({ label: a.innerText.replace(/\s+/g,' ').trim(), href: a.href }))
```

Pair each href with its row data from the page text. That is what makes the deliverable clickable.

## Step 6: Screenshot and export

Screenshot the comp table and save it alongside the writeup.

The Comps view also has **Download PDF** and **Download CSV**, bottom right. The CSV is the cleanest artifact to keep.

🚨 **Ask before downloading anything.** Name the file and where it lands, then wait for a yes.

## Step 7: Analyze

```
Indicated value = subject sqft × $/sqft
```

Report the spread, not one number:

1. **Closest real sale** by sqft and bed/bath, adjusted up or down for age and lot
2. **Median $/sqft** across usable comps. Median, not mean. Drop obvious junk rows (near-zero prices, land-only, 2x-sqft outliers) and say which you dropped and why.
3. **PropWire's Comp-Based Value** with your selection stated
4. Cross-check against PropWire's own **Estimated Property Value** on the Property tab

For a wholesale deal, close the loop:

```
Repair allowance = (0.70 × ARV) − contract or asking price
```

Then say whether that allowance covers the rehab the property actually needs. If it doesn't, the deal is priced for a buyer class that was never going to take it.

## Step 8: Cross-check the property facts

⚠️ **Property-data vendors disagree with each other, routinely.** On the test subject, four fields conflicted between two tools:

| Field | Tool A | Tool B |
|---|---|---|
| Baths | 2 | 3 |
| Basement | **None** | **Full** |
| Owner status | Absentee | Owner occupied |
| Last sale | 1993 | blank |

Basement alone is a real dollar swing on a small ranch. **Never present a disputed field as settled.** Name the conflict and say which one needs a human to resolve.

PropWire also contradicted itself on that run: it tagged the owner **Absentee** while listing the owner's mailing address as the subject property.

## Deliverable format

- Subject line: bd/ba, sqft, lot, year, style, utilities, zoning
- Filter path walked and where it resolved
- **Real sales table** with a clickable link per row
- **Estimate-only table**, clearly separated, also clickable
- Indicated value range, three ways
- PropWire Comp-Based Value and the selection behind it
- Any field conflicts against other sources
- **Screenshot attached**

## Field notes

Verified 2026-08-06 on a rural Pennsylvania subject.

- Free tier is enough for a full comp run. No credits consumed.
- Tabs on a property: **Property / Owner / Comps / History / Market**. Owner, History, and Market are unexplored.
- Lead tags surface on the property card: `Absentee Owners`, `Free & Clear`, `High Equity`, `Off-Market`.
- Maps are Mapbox.
- 🚨 **PropWire runs DataDome bot protection.** Drive it at human pace. Do not build a scraper against it and do not hammer it in a loop, or the account gets challenged or blocked.
