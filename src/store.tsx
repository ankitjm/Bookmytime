import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Booking, Holding, PortfolioState, Quote, Side, Trade } from './types';
import { STARTING_CASH } from './data';
import { bestAsk, bestBid, seedQuotes, tickQuotes } from './market';

const STORAGE_KEY = 'timemarket.portfolio.v1';

function loadPortfolio(): PortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PortfolioState;
  } catch {
    /* ignore */
  }
  return { cash: STARTING_CASH, holdings: [], bookings: [], trades: [] };
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface TradeResult {
  ok: boolean;
  message: string;
}

interface MarketContextValue {
  quotes: Record<string, Quote>;
  portfolio: PortfolioState;
  /** Live total value of holdings at current bid prices. */
  positionsValue: number;
  netWorth: number;
  trade: (personId: string, side: Side, hours: number) => TradeResult;
  book: (personId: string, when: string, topic: string) => TradeResult;
  completeBooking: (bookingId: string) => void;
  holdingFor: (personId: string) => Holding | undefined;
  resetAccount: () => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>(() => seedQuotes());
  const [portfolio, setPortfolio] = useState<PortfolioState>(loadPortfolio);
  const quotesRef = useRef(quotes);
  quotesRef.current = quotes;

  // Live market loop — retick every 1.5s for the trading-floor feel.
  useEffect(() => {
    const id = setInterval(() => {
      setQuotes((q) => tickQuotes(q));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Persist portfolio.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      /* ignore */
    }
  }, [portfolio]);

  const holdingFor = useCallback(
    (personId: string) => portfolio.holdings.find((h) => h.personId === personId),
    [portfolio.holdings],
  );

  const trade = useCallback<MarketContextValue['trade']>((personId, side, hours) => {
    if (!Number.isFinite(hours) || hours <= 0) {
      return { ok: false, message: 'Enter a whole number of hours.' };
    }
    hours = Math.floor(hours);
    const q = quotesRef.current[personId];
    if (!q) return { ok: false, message: 'Unknown ticker.' };

    let result: TradeResult = { ok: false, message: '' };
    setPortfolio((prev) => {
      const existing = prev.holdings.find((h) => h.personId === personId);
      if (side === 'BUY') {
        const fill = bestAsk(q.price);
        const cost = fill * hours;
        if (cost > prev.cash) {
          result = { ok: false, message: `Insufficient cash. Need TIME$${cost.toFixed(0)}.` };
          return prev;
        }
        const prevHours = existing?.hours ?? 0;
        const prevCost = (existing?.avgCost ?? 0) * prevHours;
        const newHolding: Holding = {
          personId,
          hours: prevHours + hours,
          avgCost: (prevCost + cost) / (prevHours + hours),
        };
        const holdings = existing
          ? prev.holdings.map((h) => (h.personId === personId ? newHolding : h))
          : [...prev.holdings, newHolding];
        const trades = appendTrade(prev.trades, personId, 'BUY', hours, fill);
        result = { ok: true, message: `Bought ${hours}h ${personId.toUpperCase()} @ ${fill.toFixed(2)}` };
        return { ...prev, cash: prev.cash - cost, holdings, trades };
      } else {
        if (!existing || existing.hours < hours) {
          result = { ok: false, message: 'You do not own that many hours.' };
          return prev;
        }
        const fill = bestBid(q.price);
        const proceeds = fill * hours;
        const remaining = existing.hours - hours;
        const holdings =
          remaining > 0
            ? prev.holdings.map((h) =>
                h.personId === personId ? { ...h, hours: remaining } : h,
              )
            : prev.holdings.filter((h) => h.personId !== personId);
        const trades = appendTrade(prev.trades, personId, 'SELL', hours, fill);
        result = { ok: true, message: `Sold ${hours}h ${personId.toUpperCase()} @ ${fill.toFixed(2)}` };
        return { ...prev, cash: prev.cash + proceeds, holdings, trades };
      }
    });
    return result;
  }, []);

  const book = useCallback<MarketContextValue['book']>((personId, when, topic) => {
    if (!when) return { ok: false, message: 'Pick a date and time.' };
    const scheduled = new Date(when);
    if (Number.isNaN(scheduled.getTime())) return { ok: false, message: 'Invalid date.' };
    if (scheduled.getTime() < Date.now()) {
      return { ok: false, message: 'The hour must be in the future.' };
    }
    let result: TradeResult = { ok: false, message: '' };
    setPortfolio((prev) => {
      const existing = prev.holdings.find((h) => h.personId === personId);
      if (!existing || existing.hours < 1) {
        result = { ok: false, message: 'You need to own at least 1 hour to book.' };
        return prev;
      }
      const remaining = existing.hours - 1;
      const holdings =
        remaining > 0
          ? prev.holdings.map((h) => (h.personId === personId ? { ...h, hours: remaining } : h))
          : prev.holdings.filter((h) => h.personId !== personId);
      const booking: Booking = {
        id: uid(),
        personId,
        when: scheduled.toISOString(),
        topic: topic.trim() || 'General discussion',
        status: 'SCHEDULED',
      };
      result = { ok: true, message: 'Hour booked & redeemed from your position.' };
      return { ...prev, holdings, bookings: [booking, ...prev.bookings] };
    });
    return result;
  }, []);

  const completeBooking = useCallback((bookingId: string) => {
    setPortfolio((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'COMPLETED' } : b,
      ),
    }));
  }, []);

  const resetAccount = useCallback(() => {
    setPortfolio({ cash: STARTING_CASH, holdings: [], bookings: [], trades: [] });
  }, []);

  const positionsValue = useMemo(() => {
    return portfolio.holdings.reduce((sum, h) => {
      const q = quotes[h.personId];
      return sum + (q ? bestBid(q.price) * h.hours : 0);
    }, 0);
  }, [portfolio.holdings, quotes]);

  const value: MarketContextValue = {
    quotes,
    portfolio,
    positionsValue,
    netWorth: portfolio.cash + positionsValue,
    trade,
    book,
    completeBooking,
    holdingFor,
    resetAccount,
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

function appendTrade(
  trades: Trade[],
  personId: string,
  side: Side,
  hours: number,
  price: number,
): Trade[] {
  const t: Trade = { id: uid(), personId, side, hours, price, ts: Date.now() };
  return [t, ...trades].slice(0, 100);
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}
