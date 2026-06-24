import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PEOPLE } from '../data';
import { bestAsk, bestBid, buildOrderBook, fmtMoney } from '../market';
import { useMarket } from '../store';
import { PriceChart } from '../components/Charts';
import type { Side } from '../types';

export function TradePage() {
  const { id = '' } = useParams();
  const { quotes, holdingFor, trade, book } = useMarket();
  const person = PEOPLE.find((p) => p.id === id);
  const quote = quotes[id];

  const [mode, setMode] = useState<'trade' | 'book'>('trade');
  const [side, setSide] = useState<Side>('BUY');
  const [hours, setHours] = useState('1');
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [when, setWhen] = useState('');
  const [topic, setTopic] = useState('');

  const holding = holdingFor(id);

  const orderBook = useMemo(
    () => (quote ? buildOrderBook(quote.price, id.length * 7 + 13) : { bids: [], asks: [] }),
    [quote?.price, id],
  );

  if (!person || !quote) {
    return (
      <div className="container">
        <Link className="back" to="/">
          ← Back to the floor
        </Link>
        <div className="empty">
          <div className="big">🔍</div>Ticker not found.
        </div>
      </div>
    );
  }

  const up = quote.changePct >= 0;
  const ask = bestAsk(quote.price);
  const bid = bestBid(quote.price);
  const qty = Math.max(0, Math.floor(Number(hours) || 0));
  const fillPrice = side === 'BUY' ? ask : bid;
  const estTotal = fillPrice * qty;

  const submitTrade = () => {
    const res = trade(id, side, qty);
    setToast({ ok: res.ok, msg: res.message });
  };
  const submitBooking = () => {
    const res = book(id, when, topic);
    setToast({ ok: res.ok, msg: res.message });
    if (res.ok) {
      setWhen('');
      setTopic('');
    }
  };

  const maxDepth = Math.max(
    ...orderBook.bids.map((b) => b.hours),
    ...orderBook.asks.map((a) => a.hours),
    1,
  );

  return (
    <div className="container">
      <Link className="back" to="/">
        ← The Floor
      </Link>

      <div className="trade-layout">
        <div className="trade-main">
          {/* Quote + chart */}
          <div className="card">
            <div className="quote-hero">
              <div className="avatar">{person.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1>
                  {person.ticker}{' '}
                  <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14 }}>
                    {person.name}
                  </span>
                </h1>
                <div className="sub">{person.title}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div className="big-price">{fmtMoney(quote.price)}</div>
                <div className={`big-chg ${up ? 'up' : 'down'}`}>
                  {up ? '▲' : '▼'} {fmtMoney(Math.abs(quote.change))} (
                  {Math.abs(quote.changePct).toFixed(2)}%)
                </div>
              </div>
              <span className="sector-tag">{person.sector}</span>
            </div>

            <div style={{ marginTop: 12 }}>
              <PriceChart data={quote.history} />
            </div>

            <div className="minstats">
              <MiniStat k="Bid" v={fmtMoney(bid)} />
              <MiniStat k="Ask" v={fmtMoney(ask)} />
              <MiniStat k="Day High" v={fmtMoney(quote.dayHigh)} />
              <MiniStat k="Day Low" v={fmtMoney(quote.dayLow)} />
            </div>
          </div>

          <div className="book-stats">
            <div className="card">
              <h3>Order Book</h3>
              <div className="book-table">
                {orderBook.asks
                  .slice()
                  .reverse()
                  .map((a, i) => (
                    <div className="book-row ask" key={`a${i}`}>
                      <div className="depth" style={{ width: `${(a.hours / maxDepth) * 100}%` }} />
                      <span className="price down">{fmtMoney(a.price)}</span>
                      <span>{a.hours}h</span>
                      <span style={{ color: 'var(--muted)' }}>{fmtMoney(a.price * a.hours)}</span>
                    </div>
                  ))}
                <div className="book-spread">
                  SPREAD {fmtMoney(ask - bid)} · LAST {fmtMoney(quote.price)}
                </div>
                {orderBook.bids.map((b, i) => (
                  <div className="book-row bid" key={`b${i}`}>
                    <div className="depth" style={{ width: `${(b.hours / maxDepth) * 100}%` }} />
                    <span className="price up">{fmtMoney(b.price)}</span>
                    <span>{b.hours}h</span>
                    <span style={{ color: 'var(--muted)' }}>{fmtMoney(b.price * b.hours)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Stats & Thesis</h3>
              <p className="thesis" style={{ marginTop: 0 }}>
                {person.blurb}
              </p>
              <div style={{ marginTop: 8 }}>
                <Stat k="Volume (session)" v={`${quote.volume}h`} />
                <Stat k="Hours outstanding" v={person.hoursOutstanding.toLocaleString()} />
                <Stat
                  k="Market cap"
                  v={`TIME$ ${(quote.price * person.hoursOutstanding).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                  })}`}
                />
                <Stat k="IPO price" v={`TIME$ ${fmtMoney(person.ipoPrice)}`} />
                {holding && (
                  <Stat k="Your position" v={`${holding.hours}h @ ${fmtMoney(holding.avgCost)}`} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trade ticket */}
        <div className="trade-side">
          <div className="card ticket">
            <div className="tabs">
              <button className={mode === 'trade' ? 'active' : ''} onClick={() => setMode('trade')}>
                Trade
              </button>
              <button className={mode === 'book' ? 'active' : ''} onClick={() => setMode('book')}>
                Book the hour
              </button>
            </div>

            {mode === 'trade' ? (
              <>
                <div className="seg2">
                  <button
                    className={`buy ${side === 'BUY' ? 'active' : ''}`}
                    onClick={() => setSide('BUY')}
                  >
                    Buy
                  </button>
                  <button
                    className={`sell ${side === 'SELL' ? 'active' : ''}`}
                    onClick={() => setSide('SELL')}
                  >
                    Sell
                  </button>
                </div>

                <div className="field">
                  <label>Hours ({person.ticker})</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                  <div className="steppers">
                    {[1, 5, 10, 25].map((n) => (
                      <button key={n} onClick={() => setHours(String(n))}>
                        {n}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="row">
                    <span>Order type</span>
                    <span className="v">Market</span>
                  </div>
                  <div className="row">
                    <span>Est. fill price</span>
                    <span className="v">{fmtMoney(fillPrice)}</span>
                  </div>
                  <div className="row total">
                    <span>{side === 'BUY' ? 'Est. cost' : 'Est. proceeds'}</span>
                    <span className="v">TIME$ {fmtMoney(estTotal)}</span>
                  </div>
                </div>

                <button
                  className={`submit ${side === 'BUY' ? 'buy' : 'sell'}`}
                  disabled={qty <= 0}
                  onClick={submitTrade}
                >
                  {side === 'BUY' ? 'Buy' : 'Sell'} {qty || 0}h of {person.ticker}
                </button>
              </>
            ) : (
              <>
                <p className="thesis" style={{ marginTop: 0 }}>
                  Redeem <strong style={{ color: 'var(--text)' }}>1 hour</strong> from your position
                  to schedule a real meeting with {person.name}.
                </p>
                <div className="order-summary" style={{ marginBottom: 16 }}>
                  <div className="row">
                    <span>Hours owned</span>
                    <span className="v">{holding?.hours ?? 0}h</span>
                  </div>
                  <div className="row total">
                    <span>Cost to book</span>
                    <span className="v">1h slot</span>
                  </div>
                </div>

                <div className="field">
                  <label>Date & time</label>
                  <input
                    type="datetime-local"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>What's the agenda?</label>
                  <textarea
                    placeholder="e.g. Mentorship on scaling my startup…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <button
                  className="submit brand"
                  disabled={!holding || holding.hours < 1}
                  onClick={submitBooking}
                >
                  {holding && holding.hours >= 1 ? 'Confirm booking' : 'Buy an hour first'}
                </button>
              </>
            )}

            {toast && <div className={`toast ${toast.ok ? 'ok' : 'err'}`}>{toast.msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="minstat">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="stat-row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
