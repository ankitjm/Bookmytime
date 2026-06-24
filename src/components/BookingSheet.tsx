import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Person } from '../types';
import { fmtValue, fmtWhen } from '../market';
import { useStore } from '../store';

interface Props {
  person: Person | null;
  value: number;
  onClose: () => void;
}

const sheet = {
  hidden: { y: '100%' },
  show: { y: 0, transition: { type: 'spring' as const, damping: 30, stiffness: 320 } },
  exit: { y: '100%', transition: { duration: 0.2 } },
};

export function BookingSheet({ person, value, onClose }: Props) {
  const { book } = useStore();
  const [when, setWhen] = useState('');
  const [topic, setTopic] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const confirm = () => {
    if (!person) return;
    const res = book(person.id, when, topic);
    if (res.ok) setDone(true);
    else setErr(res.message);
  };

  const close = () => {
    setWhen('');
    setTopic('');
    setDone(false);
    setErr('');
    onClose();
  };

  return (
    <AnimatePresence>
      {person && (
        <motion.div
          className="sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="sheet"
            variants={sheet}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) close();
            }}
          >
            <div className="sheet-grab" />

            {!done ? (
              <>
                <div className="sheet-head">
                  <div
                    className="avatar lg"
                    style={{
                      background: `linear-gradient(135deg, ${person.gradient[0]}, ${person.gradient[1]})`,
                    }}
                  >
                    {person.avatar}
                  </div>
                  <div>
                    <div className="sheet-title">Book an hour with {person.name}</div>
                    <div className="sheet-sub">{person.headline}</div>
                  </div>
                </div>

                <div className="field">
                  <label>When works?</label>
                  <input
                    type="datetime-local"
                    value={when}
                    onChange={(e) => {
                      setWhen(e.target.value);
                      setErr('');
                    }}
                  />
                </div>
                <div className="field">
                  <label>What's it about?</label>
                  <textarea
                    placeholder="e.g. Catch up over coffee…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="sheet-meta">
                  <span>Time Value</span>
                  <span className="mono">✦ {fmtValue(value)}</span>
                </div>

                {err && <div className="toast err">{err}</div>}

                <motion.button
                  className="cta-primary"
                  whileTap={{ scale: 0.97 }}
                  onClick={confirm}
                >
                  Confirm booking
                </motion.button>
              </>
            ) : (
              <motion.div
                className="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="check-ring"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                >
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <motion.path
                      d="M16 29 L24 37 L41 19"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="success-title">You're booked with {person.name}!</div>
                  {when && (
                    <div className="success-sub">
                      {fmtWhen(when).date} · {fmtWhen(when).time}
                    </div>
                  )}
                </motion.div>
                <motion.button
                  className="cta-primary"
                  whileTap={{ scale: 0.97 }}
                  onClick={close}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  Done
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
