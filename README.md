# ⏱️ TimeMarket — The Exchange for Human Hours

A stock market for people's **time**. Bid, buy and sell future **1-hour timeslots**
with the people you think will matter. Think someone will be huge in 10 years?
Buy an hour with them now, watch the price move, sell it later — or **book** the
hour and actually meet.

It's a paper-trading simulation with a full trading-floor vibe: a live scrolling
ticker tape, a market board with sparklines and % change, per-person price charts,
a synthetic order book, and a buy/sell trade ticket.

## Features

- **The Floor** — a live market board of tradeable people, each with a ticker
  symbol (e.g. `ELON`, `ADA`, `SATS`), live price in `TIME$`/hour, 24h % change,
  sparkline, sector and market cap. Search and sort by price, % change, volume or cap.
- **Live price engine** — every quote ticks on a geometric random walk (per-person
  volatility & drift) every 1.5s, so the tape is always moving.
- **Trade view** — big quote, area price chart, a depth-weighted **order book**
  (bids/asks/spread), key stats and an investment "thesis" per person.
- **Trade ticket** — market **Buy/Sell** of N hours with live cost/proceeds
  estimates, filled at the simulated bid/ask.
- **Book the hour** — redeem 1 hour from a position to schedule a real meeting
  (date, time, agenda). Booked hours leave your tradeable position.
- **Portfolio** — net worth, buying power, positions with unrealized P&L marked to
  market, and a full trade blotter.
- **Bookings** — upcoming & past scheduled hours; mark them complete.
- Everything (cash, holdings, bookings, trades) persists to `localStorage`.
  You start with `TIME$ 100,000` of buying power.

## Tech

- **Vite + React 18 + TypeScript**
- **react-router-dom** for navigation
- Hand-built SVG charts (sparkline + area chart) — no charting dependency
- A small market-simulation engine in `src/market.ts`

## Run it

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

Then open the printed local URL.

## Project layout

```
src/
  data.ts            # the listed roster of people + volatility/drift
  types.ts           # domain types (Person, Quote, Holding, Booking, …)
  market.ts          # price simulation, order book, formatting helpers
  store.tsx          # MarketProvider: live quotes + portfolio + trade/book actions
  components/
    Charts.tsx       # Sparkline + PriceChart (SVG)
    TickerTape.tsx   # scrolling exchange tape
  pages/
    MarketPage.tsx   # the floor / market board
    TradePage.tsx    # quote, chart, order book, trade ticket, booking
    PortfolioPage.tsx# holdings, P&L, blotter
    BookingsPage.tsx # scheduled hours
  App.tsx            # shell + routes
  main.tsx           # entry
```

> ⚠️ TimeMarket is a fictional simulation for entertainment. The people, prices and
> timeslots are made up; nothing here is a real offer to trade anyone's time.
