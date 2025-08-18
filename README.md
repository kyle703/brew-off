# 🍺 Oktoberfest Brew-Off Results Portal

This project hosts a **static site** to display the results of the Brew-Off competition in a fun, party-friendly way.  
It pulls data from two public Google Sheets and one Google Drive folder:

- **Registrants Sheet (TSV)**: Beer entries with brewer, name, style, ABV, and label assets
- **Judging Sheet (TSV)**: Judges’ scores and results
- **Beer Label Assets (Drive folder)**: Public folder of uploaded images, used in carousel + winner reveal

## Goals

- Correctness of results is critical
- Fun, celebratory presentation that works in a party setting
- Smooth hosting flow (manual reveals, no auto-advances)
- Lightweight + cacheable to avoid runtime hiccups

---

## Features

- **Landing Page**

  - Hero banner: "Oktoberfest Brew-Off 2025"
  - Carousel of beer label images (from registrants’ Drive folder)
  - Buttons:
    - "See Results" → `/results`
    - "Register Your Beer" → external Google Form
    - "Judging Form" → external Google Form

- **Results Page**

  - Displays **category winners only after the reveal slideshow is shown**
  - Full results leaderboard available afterward, with filters
  - Category filters: Lager, Ale, Seasonal, etc.

- **Slideshow Mode (Reveal)**

  - Manual advance only (no auto transitions)
  - Host controls reveal of each winner
  - Animations encouraged (confetti, fade-in, applause cues)
  - Structure:
    1. Category name
    2. Winning beer card (label image, beer name, brewer)
    3. Transition to next category
    4. Only when complete → unlock leaderboard

- **Data Fetching**
  - Public TSV endpoints from Google Sheets
  - Public Google Drive folder for beer label assets
  - **Local caching layer**:
    - Static JSON snapshots for results and registrants
    - Static copies of images fetched + served locally for reliability
    - Useful for offline dev and event resilience

---

## Tech Stack

- Vite + React + TypeScript
- Tailwind for styling
- shadcn/ui for cards, buttons, and layout primitives
- Swiper.js for carousel
- Framer Motion for animations
- Recharts for optional category stats viz

---

## Theming & Style

- **Theme**: Festive Oktoberfest
- **Color palette**:
  - Deep navy / Bavarian blue (#1e2d4a, #0f172a)
  - Warm amber / beer gold (#f59e0b, #fbbf24)
  - Cream / parchment (#fef3c7, #f5f5dc)
- **Typography**:
  - Gothic/Fraktur for headings
  - Clean sans-serif for body
- **Style guidelines**:
  - High-contrast
  - Retro-festival vibe
  - Encourage animations and transitions

---

## Dev Setup

```bash
npm install
npm run dev
```

### Styling

- Tailwind is configured in `tailwind.config.ts` with Oktoberfest tokens.
- Global styles are in `src/index.css` using Tailwind layers.
- Fonts are loaded in `index.html` (Inter + UnifrakturCook).
