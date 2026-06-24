import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PEOPLE } from '../data';
import { fmtValue } from '../market';
import { useStore } from '../store';
import { Sparkline } from '../components/Charts';
import { BookingSheet } from '../components/BookingSheet';
import type { Person, Relationship } from '../types';

const FILTERS: ('All' | Relationship)[] = ['All', 'Family', 'Friend', 'Mentor', 'Creator'];
const LABEL: Record<string, string> = {
  All: 'All',
  Family: 'Family',
  Friend: 'Friends',
  Mentor: 'Mentors',
  Creator: 'Creators',
};

export function PeoplePage() {
  const { quotes } = useStore();
  const [filter, setFilter] = useState<'All' | Relationship>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PEOPLE.filter((p) => filter === 'All' || p.relationship === filter).filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.headline.toLowerCase().includes(q),
    );
  }, [filter, query]);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>People</h1>
          <p>Book a future hour with the people who matter.</p>
        </div>
      </div>

      <input
        className="search"
        placeholder="Search people…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="chips">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {filter === f && (
              <motion.span className="chip-bg" layoutId="chip-bg" transition={{ type: 'spring', damping: 28, stiffness: 360 }} />
            )}
            <span className="chip-label">{LABEL[f]}</span>
          </button>
        ))}
      </div>

      <motion.div
        className="people-grid"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
        key={filter + query}
      >
        {people.map((p) => {
          const q = quotes[p.id];
          const up = (q?.changePct ?? 0) >= 0;
          return (
            <motion.button
              key={p.id}
              className="person-card"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(p)}
            >
              <div
                className="person-accent"
                style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
              />
              <div
                className="avatar lg"
                style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
              >
                {p.avatar}
              </div>
              <div className="person-body">
                <div className="person-name">{p.name}</div>
                <div className="rel-tag">{p.relationship}</div>
                <div className="person-headline">{p.headline}</div>
              </div>
              <div className="person-foot">
                <div className="person-value">
                  <span className="mono">✦ {fmtValue(q?.value ?? p.value)}</span>
                  <span className={`trend sm ${up ? 'up' : 'down'}`}>
                    {up ? '▲' : '▼'} {Math.abs(q?.changePct ?? 0).toFixed(1)}%
                  </span>
                </div>
                {q && <Sparkline data={q.history} width={64} height={24} />}
              </div>
              <div className="person-book">
                <span>{p.slotsOpen} slots open</span>
                <span className="book-pill">Book →</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <BookingSheet
        person={selected}
        value={selected ? quotes[selected.id]?.value ?? selected.value : 0}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
