import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppState, Booking, IncomingRequest, ValueQuote } from './types';
import { ME, seedIncoming } from './data';
import { seedQuotes, tickQuotes } from './market';

const STORAGE_KEY = 'bookmytime.state.v2';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    /* ignore */
  }
  return { bookings: [], incoming: seedIncoming(Date.now()) };
}

interface BookResult {
  ok: boolean;
  message: string;
}

interface StoreValue {
  quotes: Record<string, ValueQuote>;
  state: AppState;
  me: typeof ME;
  myValue: number;
  pendingCount: number;
  upcomingCount: number;
  book: (personId: string, when: string, topic: string) => BookResult;
  completeBooking: (id: string) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Record<string, ValueQuote>>(() => seedQuotes());
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    const t = setInterval(() => setQuotes((q) => tickQuotes(q)), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const book = useCallback<StoreValue['book']>((personId, when, topic) => {
    if (!when) return { ok: false, message: 'Pick a day and time first.' };
    const d = new Date(when);
    if (Number.isNaN(d.getTime())) return { ok: false, message: 'That date looks off.' };
    if (d.getTime() < Date.now()) return { ok: false, message: 'Choose a time in the future.' };
    const booking: Booking = {
      id: uid(),
      personId,
      when: d.toISOString(),
      topic: topic.trim() || 'Just catching up',
      status: 'UPCOMING',
    };
    setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
    return { ok: true, message: 'Booked!' };
  }, []);

  const completeBooking = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'DONE' } : b)),
    }));
  }, []);

  const acceptRequest = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      incoming: s.incoming.map((r) => (r.id === id ? { ...r, status: 'ACCEPTED' } : r)),
    }));
  }, []);

  const declineRequest = useCallback((id: string) => {
    setState((s) => ({ ...s, incoming: s.incoming.filter((r) => r.id !== id) }));
  }, []);

  const reset = useCallback(() => {
    setState({ bookings: [], incoming: seedIncoming(Date.now()) });
  }, []);

  const pendingCount = state.incoming.filter((r: IncomingRequest) => r.status === 'PENDING').length;
  const upcomingCount = state.bookings.filter((b) => b.status === 'UPCOMING').length;

  const value = useMemo<StoreValue>(
    () => ({
      quotes,
      state,
      me: ME,
      myValue: quotes['me']?.value ?? ME.value,
      pendingCount,
      upcomingCount,
      book,
      completeBooking,
      acceptRequest,
      declineRequest,
      reset,
    }),
    [quotes, state, pendingCount, upcomingCount, book, completeBooking, acceptRequest, declineRequest, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
