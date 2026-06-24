// Core domain types for TimeMarket — the exchange for human hours.

/** A tradeable person. Their "stock" is a claim on a future 1-hour timeslot. */
export interface Person {
  id: string;
  /** Exchange ticker symbol, e.g. "ELON". */
  ticker: string;
  name: string;
  title: string;
  sector: string;
  /** Single-emoji avatar used across the UI. */
  avatar: string;
  blurb: string;
  /** IPO / listing price in TIME-dollars per hour. */
  ipoPrice: number;
  /** Total hours ever issued (shares outstanding). */
  hoursOutstanding: number;
}

/** A live, simulated quote for a person. */
export interface Quote {
  personId: string;
  price: number;
  /** Absolute change vs. previous session close. */
  change: number;
  /** Percent change vs. previous session close. */
  changePct: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  /** Hours traded in the session. */
  volume: number;
  /** Recent price points for the sparkline / chart (oldest → newest). */
  history: number[];
}

/** One resting order in a person's order book. */
export interface BookOrder {
  price: number;
  /** Number of one-hour slots at this price level. */
  hours: number;
}

export interface OrderBook {
  bids: BookOrder[]; // sorted high → low
  asks: BookOrder[]; // sorted low → high
}

export type Side = 'BUY' | 'SELL';

/** A position the user holds: N future hours with a person. */
export interface Holding {
  personId: string;
  /** Number of one-hour slots owned. */
  hours: number;
  /** Average price paid per hour. */
  avgCost: number;
}

/** A booked, scheduled hour redeemed from a holding. */
export interface Booking {
  id: string;
  personId: string;
  /** ISO date-time of the scheduled hour. */
  when: string;
  topic: string;
  status: 'SCHEDULED' | 'COMPLETED';
}

/** A trade the user executed, for the blotter / history. */
export interface Trade {
  id: string;
  personId: string;
  side: Side;
  hours: number;
  price: number;
  ts: number;
}

export interface PortfolioState {
  cash: number;
  holdings: Holding[];
  bookings: Booking[];
  trades: Trade[];
}
