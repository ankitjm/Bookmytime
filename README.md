# ⏱️ BookMyTime

**Book future hours with the people who matter — and let people book yours.**

A warm, mobile-first app for booking time with family, friends, mentors and
creators. **You** are the centre: your profile shows your live *Time Value*,
your open slots, and the requests from people who want an hour with you.

Live: **https://ankitjm.github.io/Bookmytime/**

## What you can do

- **You** (home) — an animated profile hero with your live Time Value (count-up),
  a trend sparkline, open slots, a shareable booking link, and **incoming
  requests** you can accept or decline with a tap.
- **People** — browse family / friends / mentors / creators with relationship
  filters, then tap **Book** to open a booking sheet, pick a time, and confirm —
  with a delightful animated success check.
- **Bookings** — your upcoming & past hours with others, plus who's booked you.

Everything (your bookings + requests) persists locally in the browser.

## Design

- Clean, premium **light** theme with a violet brand, soft shadows and rounded cards
- **Mobile-first** with a floating bottom tab bar and an elevated centre "You" orb
- Rich **motion** via `framer-motion`: page/stagger entrances, count-up numbers,
  spring taps, a draggable booking sheet, and an animated confirmation

## Tech

- **Vite + React 18 + TypeScript**, **react-router**, **framer-motion**
- Hand-built SVG charts (sparkline + area), gentle value-trend simulation in
  `src/market.ts`

## Run it

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # preview the build
```

## Layout

```
src/
  data.ts            # people, your profile (ME), seeded requests
  types.ts           # Person, Booking, IncomingRequest, Me, ValueQuote
  market.ts          # value-trend simulation + formatting
  store.tsx          # StoreProvider: quotes, bookings, requests, actions
  components/        # Charts, CountUp, BookingSheet
  pages/             # YouPage, PeoplePage, BookingsPage
  App.tsx            # shell + bottom nav + routes
```

> BookMyTime is a friendly demo — people, values and requests are fictional.
