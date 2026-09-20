# Theme packs

Each competition instance picks a `theme_id`. The app sets `document.documentElement.dataset.theme` to that id.

- `themes/baseline/tokens.css` — default tasting-sheet template (always loaded)
- `themes/<year>/tokens.css` — overrides under `[data-theme="<year>"]`
- `themes/<year>/theme.json` — pack metadata

Do not change layout in a year pack. Override color, type, and background tokens only.
