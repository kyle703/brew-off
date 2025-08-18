# ✅ Brew-Off Portal TODO

## Foundation

- [x] Define theme (colors, fonts, Oktoberfest aesthetic) Add the aesthetic to the STYLE.md file
- [x] Configure Tailwind + shadcn theme tokens
- [ ] Build cache system for TSV + images
- [ ] Set up router with `/`, `/results`, `/reveal`

## Data Layer

- [ ] Fetch utility for TSV parsing
- [ ] Parse registrants for beer metadata + labels
- [ ] Parse judging sheet for category scores
- [ ] Cache results + images locally

## Home Page

- [ ] Hero section with title + year
- [ ] Carousel of beer labels (Drive assets)
- [ ] Buttons:
  - [ ] See Results (→ `/results`)
  - [ ] Register Beer (external form)
  - [ ] Judging Form (external form)

## Results Page

- [ ] Initially blank (hidden behind reveal gate)
- [ ] Unlock leaderboard only after reveal slideshow is complete
- [ ] Full results table, filterable by category
- [ ] Winner highlights at top after reveal

## Reveal Slideshow

- [ ] Manual advance (no auto transitions)
- [ ] Step order:
  1. Category card
  2. Winner beer card
  3. Pause for applause
  4. Transition animation
- [ ] Confetti animation when winners revealed
- [ ] Fun, party-style transitions

## Styling & Animations

- [ ] Festive theme integration
- [ ] Beer label cards styled cleanly
- [ ] Animated reveals (Framer Motion)
- [ ] Confetti & celebration effects

## Deployment

- [ ] Add static fallback cache JSON + images
- [ ] Configure CI/CD to Netlify / Vercel
- [ ] Verify TSV + Drive folder endpoints are public

```

```
