# Theme packs

Each competition instance picks a `theme_id`. The app sets `document.documentElement.dataset.theme` to that id.

- `themes/baseline/tokens.css` — tasting-sheet template (always loaded)
- `themes/<year>/tokens.css` — overrides under `[data-theme="<year>"]`
- `themes/<year>/theme.json` — pack metadata
- `public/themes/<year>/` — atmosphere, favicon, and other static art

Year packs may override color, type, atmosphere, chrome, and ceremony copy. They should not change tap-target size, form layout, or scoring flow. Sheets, fields, and buttons stay high-contrast even when the stage behind them is theatrical.
