import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PEOPLE } from '../data';
import { fmtCompact, fmtMoney } from '../market';
import { useMarket } from '../store';
import { Sparkline } from '../components/Charts';

type SortKey = 'price' | 'changePct' | 'volume' | 'cap';

export function MarketPage() {
  const { quotes } = useMarket();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('changePct');

  const rows = useMemo(() => {
    const list = PEOPLE.filter((p) => {
      const q = (query || '').toLowerCase();
      return (
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.ticker.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q)
      );
    }).map((p) => {
      const quote = quotes[p.id];
      return { p, quote, cap: quote.price * p.hoursOutstanding };
    });
    list.sort((a, b) => {
      if (sort === 'price') return b.quote.price - a.quote.price;
      if (sort === 'changePct') return b.quote.changePct - a.quote.changePct;
      if (sort === 'volume') return b.quote.volume - a.quote.volume;
      return b.cap - a.cap;
    });
    return list;
  }, [quotes, query, sort]);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>The Floor</h1>
          <p>Trade future 1-hour timeslots with the people who'll matter. Prices in TIME$ / hour.</p>
        </div>
        <span className="pill live">Market Open</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          className="search"
          placeholder="Search name, ticker or sector…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            color: 'var(--text)',
            borderRadius: 9,
            padding: '11px 14px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <div className="seg" style={{ margin: 0, gridTemplateColumns: 'repeat(4,auto)' }}>
          {(
            [
              ['changePct', '% Chg'],
              ['price', 'Price'],
              ['volume', 'Volume'],
              ['cap', 'Mkt Cap'],
            ] as [SortKey, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={sort === k ? 'active' : ''}
              style={{
                background: sort === k ? 'var(--panel-2)' : 'transparent',
                color: sort === k ? 'var(--text)' : 'var(--muted)',
                padding: '8px 12px',
                fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="board">
        <div className="board-head">
          <span>#</span>
          <span>Person</span>
          <span className="col-hide" style={{ textAlign: 'right' }}>
            Sector
          </span>
          <span style={{ textAlign: 'right' }}>Last</span>
          <span style={{ textAlign: 'right' }}>24h</span>
          <span className="col-hide" style={{ textAlign: 'right' }}>
            Trend / Cap
          </span>
          <span style={{ textAlign: 'right' }}>Trade</span>
        </div>
        {rows.map(({ p, quote, cap }, i) => {
          const up = quote.changePct >= 0;
          return (
            <div className="board-row" key={p.id} onClick={() => navigate(`/trade/${p.id}`)}>
              <span className="num" style={{ color: 'var(--muted)' }}>
                {i + 1}
              </span>
              <div className="asset">
                <div className="avatar">{p.avatar}</div>
                <div className="meta">
                  <div className="sym">{p.ticker}</div>
                  <div className="name">{p.name}</div>
                </div>
              </div>
              <div className="col-hide" style={{ textAlign: 'right' }}>
                <span className="sector-tag">{p.sector}</span>
              </div>
              <div className="num">{fmtMoney(quote.price)}</div>
              <div className={`chg ${up ? 'up' : 'down'}`} style={{ justifyContent: 'flex-end' }}>
                {up ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(2)}%
              </div>
              <div
                className="col-hide"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}
              >
                <Sparkline data={quote.history} up={up} />
                <span className="num" style={{ color: 'var(--muted)', minWidth: 70 }}>
                  {fmtCompact(cap)}
                </span>
              </div>
              <button
                className="trade-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/trade/${p.id}`);
                }}
              >
                Trade
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
