# AGENTS.md

## Project

Recipe data tool: `sauces.json` and `recipes.json` are the source of truth. A Vite + React + TypeScript app (repo root) renders everything; no styling yet by design.

## Commands

```sh
npm run dev       # dev server for the recipe viewer
npm run build     # tsc -b && vite build
npm run lint      # eslint .
```

## Gotchas

- `recipes.json` has two sets: `quick` (fast start-to-ready) and `batch` (low active time, freezer-friendly, with `batch_servings`, `fridge_days`, `freezes_well`, `reheat`). Both sets are high-calorie/high-protein and center animal protein.
- Recipe fields vary between sets: batch recipes have storage/reheat fields; `sauce` is optional everywhere. Types in `src/types.ts` mirror this — keep them in sync when editing the JSON schema.
- `sauces.json`: each sauce is a dict with keys `name`, `technique`, `flavor`, `protein`, `ingredients`, `notes`. `technique` is one of `blend`, `simmer`, `pan` (butter/oil sauté & deglaze), or `no-cook`.
- Recipes reference sauces by exact name in the `sauce` field; a future recipe composer will join on this. Keep names stable when renaming.
- User preferences baked into the data: no lentil/legume-only dishes, cuisines skew Mexican/Indian/Asian.
