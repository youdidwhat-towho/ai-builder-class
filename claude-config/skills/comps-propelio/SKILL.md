---
name: comps-propelio
description: Run a comparable sales analysis in Propelio. Built for non-disclosure states (TX, TN, LA, MS, UT, ID, KS, AK, NM, ND, WY, MO, MT) where sold prices are not public record and the MLS feed is the only source. Use when the user says "run comps in propelio", "/comps-propelio", or names a property in a non-disclosure state. Carries the coverage check, the legacy-app blank-page trap, the radius/time widening sequence, and the actives-versus-solds trap.
---

# Comps in Propelio

Propelio pulls from the local MLS feed, which is why it works in **non-disclosure states** where county records carry no sale price. In those markets a public-records tool literally cannot tell you what anything sold for.

**You need:** a paid Propelio account, logged in, and a browser-automation tool.

**Do not report the AVM as a value.** Propelio's "Estimated Value" is an as-is automated estimate. It is a sanity check, never the answer, and it never goes in front of a seller, buyer, or appraiser.

---

## Step 0: 🚨 Check coverage before anything else

**Propelio's MLS comp coverage is partial, and where it is missing there is no workaround.** The property record still loads, so it looks like it is working right up until the Comparable Sales tab, which returns:

> "Looks like we do not have coverage in this area. Please see the map below for our current coverage."

Two tiers on the in-app map:

| Color | Tier |
|---|---|
| **Blue** | Property Data only. **No MLS comps.** |
| **Yellow** | MLS Comps + Property Data |

**Yellow** (verified 2026-08-06): TX, OK, NM, most of AR, LA, MS, AL, GA, FL, TN, MT, WV, parts of KS/MO/CO/WY/NE, chunks of the Carolinas, small New England pockets.

**Blue (no comps)** includes the entire Northeast and West Coast: PA, NY, NJ, CA, OR, WA, AZ, NV, OH, MI, IN, IL, VA, MD, and more.

🧩 That footprint tracks the non-disclosure map plus the southeast, which is the product's reason to exist. **In a disclosure state you usually don't need Propelio and often can't use it.** Route to `comps-propwire`, a public-records tool, or your local MLS instead.

Coverage changes. Read the map, don't trust this list.

## Step 1: Open the right app

🚨 **Go to `https://genesis.propelio.com/search`.** That is the current app.

**The legacy-app trap:** `app.propelio.com` is the old app. Its property detail pages throw a minified React error and render a **completely blank white page**. Nothing is wrong with your login or the property. If you land there, click the red **Exit Legacy App** button top right, which redirects to `genesis.propelio.com`. Verified broken 2026-08-06.

## Step 2: Pull the subject record

Type the full address in the search bar, click the autocomplete match, wait a few seconds.

Use a page-text extraction rather than screenshots. Capture:

- Beds, baths, **sqft**, lot sqft, acres, **year built**, stories, pool, basement
- Last sale price and date
- Owner name, years of ownership, owner-occupied or not
- Estimated equity, active loan count
- Any tag panels: preforeclosure, liens, tax info

⚠️ **Read the tag dates, don't trust the badges.** Propelio shows a "Preforeclosure" badge off any recorded notice, however old. On one test subject the badge came from a Notice of Trustee Sale recorded in 2016 with a 2016 auction date. Ten years stale and long cured. Always open the tag panel and read the recording date before repeating a badge to anyone.

⚠️ **Check owner versus seller.** If the owner of record has held for decades and is owner-occupied, whoever is marketing the property is a wholesaler holding a contract, not the seller. Worth saying out loud.

## Step 3: Run the comps

Click **COMPARABLE SALES**.

The toolbar carries `PROP TYPE`, `SOLD WITHIN`, `DISTANCE`, `YEAR BUILT`, and `ALL FILTERS`. The last opens a drawer with House Size, Lot Size Acres, Beds, Baths, Garage, Pools.

### Don't over-filter

**The defaults are usually fine on beds, baths, and square footage. Radius and time window are the levers.** Some properties have tons of comps and are easy. Others are thin, and no amount of filtering conjures sales that did not happen.

Over-constraining produces a false negative that looks like a market signal. On one test subject, stacking single-family + a 25-year build window + 3-5 beds + a 900 sqft band at 0.5 mile / 6 months returned **one result: the subject itself.**

### The widening sequence

| Step | Distance | Sold within |
|---|---|---|
| 1 | 0.5 mile | 6 months |
| 2 | 1 mile | 6 months |
| 3 | 1 mile | 1 year |
| 4 | 2 miles | 1 year |
| 5 | 2 miles | 2 years |
| 6 | 1 mile | 5 years |
| 7 | 3-5 miles | 5 years |

Dense metro usually resolves by step 2 or 3. Rural and low-velocity submarkets often need step 6 or 7.

**Widening past 1 year is a finding, not a workaround.** Say so in the output.

Coordinate clicks are more reliable than element references on these menus. Screenshot after each change and confirm the toolbar label actually updated before moving on.

## Step 4: 🚨 Read the Sold statistics, not the list

Scroll to the bottom of the CMA table. There is a tab strip: **All / Sold / Pending / Active / Off Market**, and below it **Summary Statistics** with Minimum, Maximum, Average rows.

**Click Sold.** Read `Sale Price` and `SP Sqft` from the Average row. That is the working number.

🚨 **The result list mixes actives and solds, and actives dominate in thin markets.** A CMA showing "9 results" can be nine active listings and zero sales. The list will not tell you. **The Sold statistics panel showing all dashes is the tell** that there are no sales in your window, and it is the single most important check in this skill.

Active list prices are not comps. In a slow market they are a record of what did not work. Note their days on market: on one test run every active had been sitting 700 to 1,000 days.

## Step 5: Do the math

```
Indicated value = subject sqft × SP/sqft
```

Run it three ways and give the spread:

1. **Average SP/sqft** across the whole sold set
2. **Recent-sales SP/sqft** using only the newest sales, usually the honest number
3. **Closest-match SP/sqft** from the one or two solds nearest in size, age, and condition

Adjust for size. Smaller homes carry a higher price per square foot, so a 1,600 sqft comp will overstate a 2,100 sqft subject.

For a wholesale deal:

```
Repair allowance = (0.70 × ARV) − contract or asking price
```

Then say whether that allowance covers the rehab the property actually needs.

## Step 6: Report

- Subject line: beds/baths, sqft, year, lot
- **The filter path you walked** and where it resolved
- The sold table: address, sold date, sqft, sale price, $/sqft, days on market
- Sold summary: min / average / max on sale price and $/sqft
- Indicated value range, three ways
- **Market velocity read:** how recent the newest sale is, and how fast solds went once priced right
- Anything that contradicts a prior number, stated plainly

### Report these honestly

- **Newest sale age.** If the most recent comparable sale is over a year old, lead with it. On one test subject the newest was two years stale, which mattered more to the decision than the ARV did.
- **Sold days on market.** Low DOM on solds plus a long stack of aged actives means pricing is the binding constraint, not demand.
- **Sample size.** Say how many solds carried the average. Three sales is not a market.

## Field notes

- Result sets cap at **100**. A banner says so. Tighten rather than paging.
- The MLS attribution line at the bottom of the CMA names the board and the exact date window queried. Read it to confirm what was actually searched.
- `SET DEFAULT` saves a filter preset.
- There is a printer icon for PDF export, plus `RENTALS` and `REPORT` tabs alongside `SALES`.
- A `CASH BUYERS` tab exists and is directly relevant to disposition. Unexplored.

## A note on the backend

Propelio's web app is a single-page app talking to a backend at `api.propelio.com`. There is no public API and no developer documentation. Calls are authenticated by a session cookie, so anything you do there runs as your own logged-in account.

If you go looking, understand the tradeoffs before you build on it: an undocumented endpoint can change or disappear without notice, and a vendor is within their rights to view heavy automated use as working around their interface. **Drive the interface at human pace, don't build scrapers, and don't design anything you'd be upset to have break.** The skill above works entirely through the normal UI for exactly that reason.
