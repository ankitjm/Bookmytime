import type { IncomingRequest, Me, Person } from './types';

// Your roster — a warm mix of family, friends, mentors and creators.
export const PEOPLE: Person[] = [
  {
    id: 'mom',
    name: 'Mom',
    avatar: '🌷',
    relationship: 'Family',
    headline: 'Sunday calls & the best advice, always',
    gradient: ['#ff9a9e', '#fad0c4'],
    value: 9600,
    slotsOpen: 5,
  },
  {
    id: 'dad',
    name: 'Dad',
    avatar: '🎣',
    relationship: 'Family',
    headline: 'Fishing trips, life lessons, bad puns',
    gradient: ['#a1c4fd', '#c2e9fb'],
    value: 9100,
    slotsOpen: 4,
  },
  {
    id: 'aanya',
    name: 'Aanya',
    avatar: '🎨',
    relationship: 'Family',
    headline: 'Little sister, big artist energy',
    gradient: ['#fbc2eb', '#a6c1ee'],
    value: 5200,
    slotsOpen: 6,
  },
  {
    id: 'rohan',
    name: 'Rohan',
    avatar: '🎮',
    relationship: 'Friend',
    headline: 'Best friend since 4th grade',
    gradient: ['#84fab0', '#8fd3f4'],
    value: 4300,
    slotsOpen: 3,
  },
  {
    id: 'priya',
    name: 'Priya',
    avatar: '☕',
    relationship: 'Friend',
    headline: 'Coffee, gossip, gut-checks',
    gradient: ['#ffecd2', '#fcb69f'],
    value: 3900,
    slotsOpen: 4,
  },
  {
    id: 'coach',
    name: 'Coach Dev',
    avatar: '🏋️',
    relationship: 'Mentor',
    headline: 'Strength coach · accountability buddy',
    gradient: ['#f6d365', '#fda085'],
    value: 6100,
    slotsOpen: 2,
  },
  {
    id: 'mara',
    name: 'Dr. Mara',
    avatar: '🧬',
    relationship: 'Mentor',
    headline: 'Career mentor in biotech',
    gradient: ['#a8edea', '#fed6e3'],
    value: 7400,
    slotsOpen: 2,
  },
  {
    id: 'paul',
    name: 'Paul',
    avatar: '📈',
    relationship: 'Mentor',
    headline: 'Startup advisor & investor',
    gradient: ['#d4fc79', '#96e6a1'],
    value: 8800,
    slotsOpen: 1,
  },
  {
    id: 'nova',
    name: 'Nova Reyes',
    avatar: '🎧',
    relationship: 'Creator',
    headline: 'Musician on the rise — book before she blows up',
    gradient: ['#c471f5', '#fa71cd'],
    value: 7700,
    slotsOpen: 2,
  },
  {
    id: 'ada',
    name: 'Ada Lin',
    avatar: '🤖',
    relationship: 'Creator',
    headline: 'AI researcher · frontier minds',
    gradient: ['#5ee7df', '#b490ca'],
    value: 9300,
    slotsOpen: 1,
  },
  {
    id: 'kai',
    name: 'Kai Brooks',
    avatar: '⚡',
    relationship: 'Creator',
    headline: 'Climate founder building fusion',
    gradient: ['#f093fb', '#f5576c'],
    value: 8200,
    slotsOpen: 1,
  },
  {
    id: 'zen',
    name: 'Master Anh',
    avatar: '🧘',
    relationship: 'Mentor',
    headline: 'Calm in a noisy world',
    gradient: ['#84fab0', '#accbee'],
    value: 4800,
    slotsOpen: 5,
  },
];

/** You — the center of BookMyTime. */
export const ME: Me = {
  name: 'You',
  avatar: '😎',
  headline: 'Product designer · coffee chats, mentoring & brainstorms',
  value: 6400,
  slotsOpen: 4,
};

/** People who want to book YOUR time — seeded so your profile feels alive. */
export function seedIncoming(now: number): IncomingRequest[] {
  const day = 86_400_000;
  return [
    {
      id: 'rq1',
      fromName: 'Rohan',
      fromAvatar: '🎮',
      relationship: 'Friend',
      when: new Date(now + 2 * day).toISOString(),
      topic: 'Catch up + your take on my side project',
      status: 'PENDING',
    },
    {
      id: 'rq2',
      fromName: 'Priya',
      fromAvatar: '☕',
      relationship: 'Friend',
      when: new Date(now + 4 * day).toISOString(),
      topic: 'Coffee and a portfolio review',
      status: 'PENDING',
    },
    {
      id: 'rq3',
      fromName: 'Sam (mentee)',
      fromAvatar: '🌱',
      relationship: 'Mentor',
      when: new Date(now + 6 * day).toISOString(),
      topic: 'Breaking into design — 30 min mentoring',
      status: 'PENDING',
    },
  ];
}

/** Gentle per-person value drift/volatility for the trend lines. */
export const VOLATILITY: Record<string, number> = {};
export const DRIFT: Record<string, number> = {};
for (const p of PEOPLE) {
  VOLATILITY[p.id] = p.relationship === 'Creator' ? 0.05 : 0.02;
  DRIFT[p.id] = p.relationship === 'Creator' ? 0.0007 : 0.0002;
}
VOLATILITY['me'] = 0.03;
DRIFT['me'] = 0.0005;
