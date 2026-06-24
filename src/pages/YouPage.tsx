import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store';
import { fmtValue, fmtWhen } from '../market';
import { CountUp } from '../components/CountUp';
import { AreaChart, Sparkline } from '../components/Charts';

const container = {
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export function YouPage() {
  const { me, myValue, quotes, state, pendingCount, acceptRequest, declineRequest } = useStore();
  const q = quotes['me'];
  const up = (q?.changePct ?? 0) >= 0;
  const accepted = state.incoming.filter((r) => r.status === 'ACCEPTED').length;
  const upcoming = state.bookings.filter((b) => b.status === 'UPCOMING').length;
  const [copied, setCopied] = useState(false);

  const share = () => {
    const link = 'bookmytime.app/u/you';
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div className="container" variants={container} initial="hidden" animate="show">
      {/* Hero */}
      <motion.div className="hero" variants={item}>
        <div className="hero-bg" />
        <div className="hero-top">
          <div className="avatar xl ring">{me.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hero-name">{me.name}</div>
            <div className="hero-headline">{me.headline}</div>
          </div>
        </div>

        <div className="hero-value">
          <div>
            <div className="hero-value-label">Your Time Value</div>
            <div className="hero-value-num">
              ✦ <CountUp value={myValue} format={fmtValue} />
            </div>
            <div className={`trend ${up ? 'up' : 'down'}`}>
              {up ? '▲' : '▼'} {Math.abs(q?.changePct ?? 0).toFixed(2)}% this week
            </div>
          </div>
          {q && <Sparkline data={q.history} color="#fff" width={96} height={44} />}
        </div>

        <div className="hero-foot">
          <span>🟢 {me.slotsOpen} open slots this week</span>
          <motion.button className="share-btn" whileTap={{ scale: 0.95 }} onClick={share}>
            {copied ? '✓ Link copied' : '🔗 Share booking link'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="stat3" variants={item}>
        <div className="stat-cube">
          <div className="stat-num">{pendingCount}</div>
          <div className="stat-cap">Requests</div>
        </div>
        <div className="stat-cube">
          <div className="stat-num">{accepted}</div>
          <div className="stat-cap">Booked you</div>
        </div>
        <div className="stat-cube">
          <div className="stat-num">{upcoming}</div>
          <div className="stat-cap">You booked</div>
        </div>
      </motion.div>

      {/* Incoming requests */}
      <motion.div variants={item}>
        <div className="section-head">
          <h2>Requests for your time</h2>
          {pendingCount > 0 && <span className="count-pill">{pendingCount}</span>}
        </div>

        {state.incoming.length === 0 ? (
          <div className="card soft empty">
            <div className="big">🎉</div>
            You're all caught up — no pending requests.
          </div>
        ) : (
          <motion.div className="req-list" layout>
            <AnimatePresence initial={false}>
              {state.incoming.map((r) => {
                const w = fmtWhen(r.when);
                return (
                  <motion.div
                    key={r.id}
                    className="req-card"
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  >
                    <div className="avatar">{r.fromAvatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="req-name">
                        {r.fromName} <span className="rel-tag">{r.relationship}</span>
                      </div>
                      <div className="req-topic">{r.topic}</div>
                      <div className="req-when">
                        {w.date} · {w.time}
                      </div>
                    </div>
                    {r.status === 'PENDING' ? (
                      <div className="req-actions">
                        <motion.button
                          className="icon-btn ok"
                          whileTap={{ scale: 0.88 }}
                          onClick={() => acceptRequest(r.id)}
                          aria-label="Accept"
                        >
                          ✓
                        </motion.button>
                        <motion.button
                          className="icon-btn no"
                          whileTap={{ scale: 0.88 }}
                          onClick={() => declineRequest(r.id)}
                          aria-label="Decline"
                        >
                          ✕
                        </motion.button>
                      </div>
                    ) : (
                      <motion.span
                        className="accepted-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 240 }}
                      >
                        ✓ Accepted
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Your demand chart */}
      <motion.div className="card" variants={item} style={{ marginTop: 14 }}>
        <h3>Your demand, last weeks</h3>
        {q && <AreaChart data={q.history} id="me" color="var(--brand)" />}
      </motion.div>
    </motion.div>
  );
}
