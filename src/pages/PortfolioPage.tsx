import { Link, useNavigate } from 'react-router-dom';
import { PEOPLE, STARTING_CASH } from '../data';
import { bestBid, fmtMoney } from '../market';
import { useMarket } from '../store';

const byId = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

export function PortfolioPage() {
  const { portfolio, quotes, positionsValue, netWorth, resetAccount } = useMarket();
  const navigate = useNavigate();

  const pnl = netWorth - STARTING_CASH;
  const pnlPct = (pnl / STARTING_CASH) * 100;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Portfolio</h1>
          <p>Your hours, positions and trade history on the TimeMarket exchange.</p>
        </div>
        <button className="link-btn" onClick={resetAccount}>
          Reset account
        </button>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="label">Net worth</div>
          <div className="value">TIME$ {fmtMoney(netWorth)}</div>
          <div className={`sub ${pnl >= 0 ? 'up' : 'down'}`}>
            {pnl >= 0 ? '▲' : '▼'} {fmtMoney(Math.abs(pnl))} ({pnlPct.toFixed(2)}%)
          </div>
        </div>
        <div className="kpi">
          <div className="label">Buying power</div>
          <div className="value">TIME$ {fmtMoney(portfolio.cash)}</div>
          <div className="sub flat">Cash available</div>
        </div>
        <div className="kpi">
          <div className="label">Positions value</div>
          <div className="value">TIME$ {fmtMoney(positionsValue)}</div>
          <div className="sub flat">{portfolio.holdings.length} holdings</div>
        </div>
        <div className="kpi">
          <div className="label">Hours owned</div>
          <div className="value">
            {portfolio.holdings.reduce((s, h) => s + h.hours, 0)}h
          </div>
          <div className="sub flat">{portfolio.bookings.length} booked</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Holdings</h3>
        {portfolio.holdings.length === 0 ? (
          <div className="empty">
            <div className="big">📈</div>
            No positions yet.{' '}
            <Link to="/" style={{ color: 'var(--accent-2)' }}>
              Head to the floor
            </Link>{' '}
            and buy your first hour.
          </div>
        ) : (
          <div className="board" style={{ border: 'none' }}>
            <div className="board-head" style={{ gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr 96px' }}>
              <span>Person</span>
              <span style={{ textAlign: 'right' }}>Hours</span>
              <span style={{ textAlign: 'right' }}>Avg cost</span>
              <span style={{ textAlign: 'right' }}>Mark</span>
              <span style={{ textAlign: 'right' }}>Unreal. P&L</span>
              <span style={{ textAlign: 'right' }}></span>
            </div>
            {portfolio.holdings.map((h) => {
              const p = byId[h.personId];
              const mark = bestBid(quotes[h.personId].price);
              const value = mark * h.hours;
              const cost = h.avgCost * h.hours;
              const pl = value - cost;
              const plPct = (pl / cost) * 100;
              return (
                <div
                  className="board-row"
                  key={h.personId}
                  style={{ gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr 96px' }}
                  onClick={() => navigate(`/trade/${h.personId}`)}
                >
                  <div className="asset">
                    <div className="avatar">{p.avatar}</div>
                    <div className="meta">
                      <div className="sym">{p.ticker}</div>
                      <div className="name">{p.name}</div>
                    </div>
                  </div>
                  <div className="num">{h.hours}h</div>
                  <div className="num">{fmtMoney(h.avgCost)}</div>
                  <div className="num">{fmtMoney(mark)}</div>
                  <div className={`num ${pl >= 0 ? 'up' : 'down'}`}>
                    {pl >= 0 ? '+' : '−'}
                    {fmtMoney(Math.abs(pl))}
                    <div style={{ fontSize: 11 }}>({plPct.toFixed(2)}%)</div>
                  </div>
                  <button
                    className="trade-btn"
                    style={{ background: 'var(--panel-2)', color: 'var(--text)', borderColor: 'var(--line-2)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trade/${h.personId}`);
                    }}
                  >
                    Trade
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Trade Blotter</h3>
        {portfolio.trades.length === 0 ? (
          <div className="empty" style={{ padding: 30 }}>
            No trades executed yet.
          </div>
        ) : (
          <div className="blotter">
            <div className="blotter-row" style={{ color: 'var(--muted)' }}>
              <span>Side</span>
              <span>Ticker</span>
              <span style={{ textAlign: 'right' }}>Hours</span>
              <span style={{ textAlign: 'right' }}>Price</span>
              <span style={{ textAlign: 'right' }}>Time</span>
            </div>
            {portfolio.trades.map((t) => {
              const p = byId[t.personId];
              return (
                <div className="blotter-row" key={t.id}>
                  <span className={t.side === 'BUY' ? 'tag-buy' : 'tag-sell'}>{t.side}</span>
                  <span>
                    {p.ticker} <span style={{ color: 'var(--muted)' }}>{p.name}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>{t.hours}h</span>
                  <span style={{ textAlign: 'right' }}>{fmtMoney(t.price)}</span>
                  <span style={{ textAlign: 'right', color: 'var(--muted)' }}>
                    {new Date(t.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
