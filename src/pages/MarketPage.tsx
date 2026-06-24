import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PEOPLE } from '../data';
import { fmtCompact, fmtMoney } from '../market';
import { useMarket } from '../store';
import { Sparkline } from '../components/Charts';

type SortKey = 'price' | 'changePct' | 'volume' | 'cap';

const SORTS: [SortKey, string][] = [
  ['changePct', '% Change'],
  ['price', 'Price'],
  ['volume', 'Volume'],
  ['cap', 'Mkt Cap'],
];

export function MarketPage() {
  const { quotes } = useMarket();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('changePct');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PEOPLE.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.ticker.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q),
    ).map((p) => {
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
          <p>Trade future 1-hour timeslots with the people who'll matter.</p>
        </div>
        <span className="pill live">Live</span>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search name, ticker or sector…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="seg">
          {SORTS.map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={sort === k ? 'active' : ''}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="board">
        {rows.map(({ p, quote, cap }) => {
          const up = quote.changePct >= 0;
          return (
            <div className="board-row" key={p.id} onClick={() => navigate(`/trade/${p.id}`)}>
              <div className="asset">
                <div className="avatar">{p.avatar}</div>
                <div className="meta">
                  <div className="sym">{p.ticker}</div>
                  <div className="name">{p.name}</div>
                </div>
              </div>

              <div className="row-spark">
                <Sparkline data={quote.history} up={up} />
                <span className="cap mono">{fmtCompact(cap)}</span>
              </div>

              <div className="row-right">
                <div className="row-price">{fmtMoney(quote.price)}</div>
                <span className={`chg-badge ${up ? 'up' : 'down'}`}>
                  {up ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(2)}%
                </span>
              </div>

              <button
                className="trade-btn row-trade"
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
