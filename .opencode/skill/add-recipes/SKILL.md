---
name: add-recipes
description: Use when adding new recipes to recipes.json — pulls inspiration from cookwell.com and internal ideation, then writes entries matching the repo's exact schema and user preferences. Trigger on "add a recipe", "new recipe", "more recipes", or mentions of cookwell.
---

# Add Recipes

Add new recipes to the two sets in `recipes.json` (`quick`, `batch`), drawing from cookwell.com and your own ideation.

## Sources

1. **cookwell.com** — use websearch/webfetch to find relevant CookWell recipes for the requested cuisine/dish. Treat them as *inspiration*: extract the flavor profile, core technique, and ingredient ratios, then rewrite steps in this repo's terse style. Never copy prose verbatim.
2. **Internal ideation** — fill gaps yourself when CookWell has nothing suitable, or to round out variety. Lean on existing entries in `recipes.json` and `sauces.json` for tone.

## Hard user preferences (do not violate)

- High calorie (~450+ kcal) AND high protein (~30g+) per serving; center animal protein in every recipe.
- No lentil/legume-only dishes (legumes are fine as components alongside meat).
- Cuisines skew Mexican, Indian, Cajun/Creole, and East/Southeast Asian; other regions welcome as accents.
- Available equipment only: oven, stove, pots, pans, dutch oven, crockpot.

## Set selection

- `quick`: fast start-to-ready. Total time ≤30 min, active ≈ total.
- `batch`: longer is fine but active time ≤40 min, scales to big portions. Must include `batch_servings` (10+), `fridge_days`, `freezes_well: true`, and a practical `reheat` note.
- Batch recipes must freeze well as written; if rice/pasta shouldn't be frozen, say so in `reheat`.

## Schema (match exactly — src/types.ts mirrors it)

Common fields: `name`, `cuisine`, `total_time`, `active_time` (minutes, ints),
`equipment` (array), `calories_kcal`, `protein_g` (honest per-serving estimates),
`sauce` (optional; ONLY an exact name from `sauces.json` — the UI joins on it),
`ingredients` (array of short strings with quantities), `steps` (2-4 terse imperative strings).

Batch adds: `batch_servings`, `fridge_days`, `freezes_well`, `reheat`.
Quick uses `sauce`; batch generally omits it.

## Steps style

Terse, imperative, no fluff. Quantities inline in ingredients only.
Good: `"Sear steak bites hard in hot oiled pan, 2-3 min, remove."`

## After writing

1. Validate: `python3 -c "import json; json.load(open('recipes.json'))"` (or node equivalent).
2. Sanity-check every batch entry has all four storage fields, and any `sauce`
   value exactly matches a name in `sauces.json`.
3. Run `npm run build && npm run lint`.
4. Tell the user to check `npm run dev` for the new rows.
