import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PEOPLE } from '../data';
import { fmtWhen } from '../market';
import { useStore } from '../store';

const byId = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

type Tab = 'mine' | 'me';

export function BookingsPage() {
  const { state, completeBooking } = useStore();
  const [tab, setTab] = useState<Tab>('mine');

  const upcoming = state.bookings.filter((b) => b.status === 'UPCOMING');
  const past = state.bookings.filter((b) => b.status === 'DONE');
  const bookedYou = state.incoming.filter((r) => r.status === 'ACCEPTED');

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Bookings</h1>
          <p>Your hours with others, and theirs with you.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>
          You booked
        </button>
        <button className={tab === 'me' ? 'active' : ''} onClick={() => setTab('me')}>
          Booked you
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'mine' ? (
          <motion.div
            key="mine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {upcoming.length === 0 && past.length === 0 ? (
              <div className="card soft empty">
                <div className="big">📅</div>
                No bookings yet.{' '}
                <Link to="/people" className="link-accent">
                  Find someone
                </Link>{' '}
                and book your first hour.
              </div>
            ) : (
              <>
                {upcoming.length > 0 && <div className="list-label">Upcoming</div>}
                {upcoming.map((b) => {
                  const p = byId[b.personId];
                  const w = fmtWhen(b.when);
                  return (
                    <motion.div className="b-card" key={b.id} layout whileTap={{ scale: 0.99 }}>
                      <div
                        className="avatar"
                        style={
                          p
                            ? { background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }
                            : undefined
                        }
                      >
                        {p?.avatar ?? '👤'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="b-name">{p?.name ?? 'Someone'}</div>
                        <div className="b-topic">{b.topic}</div>
                        <div className="b-when">
                          {w.date} · {w.time}
                        </div>
                      </div>
                      <button className="link-btn" onClick={() => completeBooking(b.id)}>
                        Done
                      </button>
                    </motion.div>
                  );
                })}

                {past.length > 0 && <div className="list-label">Past</div>}
                {past.map((b) => {
                  const p = byId[b.personId];
                  const w = fmtWhen(b.when);
                  return (
                    <div className="b-card faded" key={b.id}>
                      <div className="avatar">{p?.avatar ?? '👤'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="b-name">{p?.name ?? 'Someone'}</div>
                        <div className="b-topic">{b.topic}</div>
                        <div className="b-when">
                          {w.date} · {w.time}
                        </div>
                      </div>
                      <span className="badge done">✓ Done</span>
                    </div>
                  );
                })}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="me"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {bookedYou.length === 0 ? (
              <div className="card soft empty">
                <div className="big">⏳</div>
                Nobody's confirmed yet. Accept a request on{' '}
                <Link to="/" className="link-accent">
                  your profile
                </Link>
                .
              </div>
            ) : (
              bookedYou.map((r) => {
                const w = fmtWhen(r.when);
                return (
                  <div className="b-card" key={r.id}>
                    <div className="avatar">{r.fromAvatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="b-name">
                        {r.fromName} <span className="rel-tag">{r.relationship}</span>
                      </div>
                      <div className="b-topic">{r.topic}</div>
                      <div className="b-when">
                        {w.date} · {w.time}
                      </div>
                    </div>
                    <span className="badge done">✓ Confirmed</span>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
