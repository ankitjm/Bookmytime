import type { OrderBook, Quote } from './types';
import { DRIFT, PEOPLE, VOLATILITY } from './data';

// ---- Deterministic-ish RNG so the initial board is stable per session ----
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller standard normal. */
function gauss(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const HISTORY_LEN = 60;

/** Build the opening quote for every listed person with a seeded price history. */
export function seedQuotes(seed = 20260624): Record<string, Quote> {
  const rng = mulberry32(seed);
  const quotes: Record<string, Quote> = {};

  for (const p of PEOPLE) {
    const sigma = VOLATILITY[p.id] ?? 0.03;
    const mu = DRIFT[p.id] ?? 0.0002;
    const history: number[] = [];
    // Walk backwards from the IPO price to create plausible prior session data.
    let price = p.ipoPrice;
    for (let i = 0; i < HISTORY_LEN; i++) {
      price = price * (1 + mu + sigma * gauss(rng) * 0.4);
      history.push(round2(price));
    }
    const last = history[history.length - 1];
    const prevClose = history[0];
    quotes[p.id] = {
      personId: p.id,
      price: last,
      prevClose,
      change: round2(last - prevClose),
      changePct: round2(((last - prevClose) / prevClose) * 100),
      dayHigh: round2(Math.max(...history)),
      dayLow: round2(Math.min(...history)),
      volume: Math.floor(rng() * 400) + 40,
      history,
    };
  }
  return quotes;
}

/** Advance every quote one tick along a geometric random walk. */
export function tickQuotes(prev: Record<string, Quote>): Record<string, Quote> {
  const next: Record<string, Quote> = {};
  for (const p of PEOPLE) {
    const q = prev[p.id];
    if (!q) continue;
    const sigma = (VOLATILITY[p.id] ?? 0.03) * 0.18; // per-tick scaling
    const mu = (DRIFT[p.id] ?? 0.0002) * 0.4;
    const shock = mu + sigma * gauss(Math.random);
    const price = round2(Math.max(1, q.price * (1 + shock)));
    const history = [...q.history.slice(1), price];
    next[p.id] = {
      ...q,
      price,
      change: round2(price - q.prevClose),
      changePct: round2(((price - q.prevClose) / q.prevClose) * 100),
      dayHigh: round2(Math.max(q.dayHigh, price)),
      dayLow: round2(Math.min(q.dayLow, price)),
      volume: q.volume + Math.floor(Math.random() * 6),
      history,
    };
  }
  return next;
}

/** Synthesize a believable order book around the current price. */
export function buildOrderBook(price: number, seedKey: number): OrderBook {
  const rng = mulberry32(seedKey + Math.floor(price));
  const spread = Math.max(1, price * 0.0025);
  const bids = [];
  const asks = [];
  let bid = price - spread / 2;
  let ask = price + spread / 2;
  for (let i = 0; i < 8; i++) {
    bid -= price * (0.0015 + rng() * 0.0025);
    ask += price * (0.0015 + rng() * 0.0025);
    bids.push({ price: round2(bid), hours: Math.ceil(rng() * 12) });
    asks.push({ price: round2(ask), hours: Math.ceil(rng() * 12) });
  }
  return { bids, asks };
}

/** Best ask = the price you'd pay to buy now; best bid = price you'd sell into. */
export function bestAsk(price: number): number {
  return round2(price + Math.max(1, price * 0.0025) / 2);
}
export function bestBid(price: number): number {
  return round2(price - Math.max(1, price * 0.0025) / 2);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtCompact(n: number): string {
  return n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 });
}
