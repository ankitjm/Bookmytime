import type { ValueQuote } from './types';
import { DRIFT, ME, PEOPLE, VOLATILITY } from './data';

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const HISTORY_LEN = 48;

/** Everything we trend: all people plus you ("me"). */
const ENTITIES = [...PEOPLE.map((p) => ({ id: p.id, value: p.value })), { id: 'me', value: ME.value }];

export function seedQuotes(seed = 20260624): Record<string, ValueQuote> {
  const rng = mulberry32(seed);
  const quotes: Record<string, ValueQuote> = {};
  for (const e of ENTITIES) {
    const sigma = VOLATILITY[e.id] ?? 0.02;
    const mu = DRIFT[e.id] ?? 0.0002;
    const history: number[] = [];
    let v = e.value;
    for (let i = 0; i < HISTORY_LEN; i++) {
      v = v * (1 + mu + sigma * gauss(rng) * 0.4);
      history.push(round2(v));
    }
    const last = history[history.length - 1];
    const first = history[0];
    quotes[e.id] = {
      id: e.id,
      value: last,
      change: round2(last - first),
      changePct: round2(((last - first) / first) * 100),
      history,
    };
  }
  return quotes;
}

export function tickQuotes(prev: Record<string, ValueQuote>): Record<string, ValueQuote> {
  const next: Record<string, ValueQuote> = {};
  for (const e of ENTITIES) {
    const q = prev[e.id];
    if (!q) continue;
    const sigma = (VOLATILITY[e.id] ?? 0.02) * 0.16;
    const mu = (DRIFT[e.id] ?? 0.0002) * 0.4;
    const base = q.history[0];
    const value = round2(Math.max(1, q.value * (1 + mu + sigma * gauss(Math.random))));
    const history = [...q.history.slice(1), value];
    next[e.id] = {
      id: e.id,
      value,
      change: round2(value - base),
      changePct: round2(((value - base) / base) * 100),
      history,
    };
  }
  return next;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function fmtValue(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function fmtWhen(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
