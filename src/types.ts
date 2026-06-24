// Domain types for BookMyTime — book future hours with people who matter,
// and let people book yours. Warm and personal, not financial.

export type Relationship = 'Family' | 'Friend' | 'Mentor' | 'Creator';

/** Someone you can book a future hour with. */
export interface Person {
  id: string;
  name: string;
  /** Single-emoji avatar. */
  avatar: string;
  relationship: Relationship;
  /** Short, human one-liner. */
  headline: string;
  /** A warm two-tone gradient "a,b" used for their card accent. */
  gradient: [string, string];
  /** Their "Time Value" — a playful social signal of how in-demand they are. */
  value: number;
  /** Open future slots this week. */
  slotsOpen: number;
}

/** Live, gently-simulated value trend for a person (and for you). */
export interface ValueQuote {
  id: string;
  value: number;
  change: number;
  changePct: number;
  history: number[];
}

/** A hour YOU booked with someone. */
export interface Booking {
  id: string;
  personId: string;
  when: string; // ISO
  topic: string;
  status: 'UPCOMING' | 'DONE';
}

/** A request from someone who wants to book YOUR time. */
export interface IncomingRequest {
  id: string;
  fromName: string;
  fromAvatar: string;
  relationship: Relationship;
  when: string; // ISO
  topic: string;
  status: 'PENDING' | 'ACCEPTED';
}

/** Your own profile — you are the center of the app. */
export interface Me {
  name: string;
  avatar: string;
  headline: string;
  /** Your Time Value. */
  value: number;
  slotsOpen: number;
}

export interface AppState {
  bookings: Booking[];
  incoming: IncomingRequest[];
}
