# AGENTS.md

## Project

Recipe data tool: `recipes.json` and `sauces.json` are the source of truth; `form_factors.json`, `proteins.json`, `techniques.json`, `accessories.json` feed the recipe Builder tab. A Vite + React + TypeScript app (repo root) renders everything; minimal Notion-esque styling.

## Commands

```sh
npm run dev       # dev server for the recipe viewer
npm run build     # tsc -b && vite build
npm run lint      # eslint .
```

## Gotchas

- `recipes.json` has two sets: `quick` (fast start-to-ready) and `batch` (low active time, freezer-friendly, with `batch_servings`, `fridge_days`, `freezes_well`, `reheat`). Both sets are high-calorie/high-protein and center animal protein.
- Recipe fields vary between sets: batch recipes have storage/reheat fields; `sauce` is optional everywhere. Types in `src/types.ts` mirror this — keep them in sync when editing the JSON schema.
- `sauces.json`: each sauce is a dict with keys `name`, `technique`, `flavor`, `ingredients`, `notes`, `region` (broad cuisine grouping) and `profile` (broad flavor-profile grouping: hot & spicy, cooling & fresh, creamy & rich, tangy & bright, sweet & glazed, umami & savory); the builder can group by either. Sauces deliberately have NO protein tags — the builder encourages unexpected pairings. `technique` is one of `blend`, `simmer`, `pan` (butter/oil sauté & deglaze), or `no-cook`.
- Recipes reference sauces by exact name in the `sauce` field; a future recipe composer will join on this. Keep names stable when renaming.
- `accessories.json`: flat list of `{ name, region, type }` — two visual groupings (broad cuisine region + texture/type) the builder can toggle between. Selection logic treats it as one flat multi-select.
- User preferences baked into the data: no lentil/legume-only dishes, cuisines skew Mexican/Indian/Asian.
