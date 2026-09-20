# Brew-Off

A house-party beer competition on Cloudflare’s free tier: bottle-first tasting, host admin, yearly skins, and a frozen archive of past years.

## What’s here

- **Live app** (`/`) — register bottles, score in any order, host-controlled reveal and results
- **History** (`/history/2025/`) — the 2025 Golden Spoon site, baked to static JSON
- **Worker** (`/api/*`) — D1 + R2, admin cookie, voter cookie, upsert ballots

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars
npx wrangler d1 migrations apply brew-off --local
npm run dev
```

Open the Vite URL. Default admin password is `brew-off`.

```bash
npm run build          # history snapshot + app
npx wrangler deploy    # after creating D1/R2 in the Cloudflare dashboard
```

Create resources once:

```bash
npx wrangler d1 create brew-off
npx wrangler r2 bucket create brew-off-labels
npx wrangler d1 migrations apply brew-off --remote
```

Put the returned D1 `database_id` in `wrangler.toml`. Set production secrets:

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put COOKIE_SECRET
```

## Host flow

1. `/admin` → open registration
2. Brewers register at `/register` (or add walk-ups in admin)
3. Print `/admin/tags` and tape QRs on bottles
4. Open tasting — guests tap a number or scan a bottle
5. Close voting (freezes the podium snapshot)
6. Start reveal on a laptop/projector, then publish results

Accidental double-votes: same phone updates the same ballot. A new phone is a new taster.

## Themes

See [themes/README.md](themes/README.md). Baseline is the tasting-sheet template; `2026` is the first yearly skin. Pick the pack on the admin instance form.
