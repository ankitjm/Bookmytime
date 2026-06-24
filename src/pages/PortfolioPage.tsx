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
  const hoursOwned = portfolio.holdings.reduce((s, h) => s + h.hours, 0);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Portfolio</h1>
          <p>Your hours, positions and trade history.</p>
        </div>
        <button className="link-btn" onClick={resetAccount}>
          Reset
        </button>
      </div>

      <div className="kpis">
        <div className="kpi feature">
          <div className="label">Net Worth</div>
          <div className="value">TIME$ {fmtMoney(netWorth)}</div>
          <div className="sub">
            {pnl >= 0 ? '▲' : '▼'} {fmtMoney(Math.abs(pnl))} ({pnlPct.toFixed(2)}%) all-time
          </div>
        </div>
        <div className="kpi">
          <div className="label">Buying Power</div>
          <div className="value">{fmtMoney(portfolio.cash)}</div>
          <div className="sub flat">Cash available</div>
        </div>
        <div className="kpi">
          <div className="label">Positions</div>
          <div className="value">{fmtMoney(positionsValue)}</div>
          <div className="sub flat">{portfolio.holdings.length} holdings</div>
        </div>
        <div className="kpi">
          <div className="label">Hours Owned</div>
          <div className="value">{hoursOwned}h</div>
          <div className="sub flat">{portfolio.bookings.length} booked</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3>Holdings</h3>
        {portfolio.holdings.length === 0 ? (
          <div className="empty">
            <div className="big">📈</div>
            No positions yet.{' '}
            <Link to="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>
              Go to the floor
            </Link>{' '}
            and buy your first hour.
          </div>
        ) : (
          portfolio.holdings.map((h) => {
            const p = byId[h.personId];
            const mark = bestBid(quotes[h.personId].price);
            const value = mark * h.hours;
            const cost = h.avgCost * h.hours;
            const pl = value - cost;
            const plPct = (pl / cost) * 100;
            const upPl = pl >= 0;
            return (
              <div
                className="holding-card"
                key={h.personId}
                onClick={() => navigate(`/trade/${h.personId}`)}
              >
                <div className="avatar">{p.avatar}</div>
                <div className="meta" style={{ minWidth: 0 }}>
                  <div className="sym">{p.ticker}</div>
                  <div className="name" style={{ color: 'var(--muted)', fontSize: 12.5 }}>
                    {h.hours}h @ {fmtMoney(h.avgCost)}
                  </div>
                </div>
                <div className="pl">
                  <div>{fmtMoney(value)}</div>
                  <div className={`chg-badge ${upPl ? 'up' : 'down'}`} style={{ marginTop: 4 }}>
                    {upPl ? '▲' : '▼'} {Math.abs(plPct).toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <h3>Trade Blotter</h3>
        {portfolio.trades.length === 0 ? (
          <div className="empty" style={{ padding: 28 }}>
            No trades executed yet.
          </div>
        ) : (
          <div className="blotter">
            {portfolio.trades.map((t) => {
              const p = byId[t.personId];
              return (
                <div className="blotter-row" key={t.id}>
                  <span className={t.side === 'BUY' ? 'tag-buy' : 'tag-sell'}>{t.side}</span>
                  <span>
                    {p.ticker}{' '}
                    <span style={{ color: 'var(--muted)' }}>
                      {t.hours}h @ {fmtMoney(t.price)}
                    </span>
                  </span>
                  <span className="b-meta">
                    {new Date(t.ts).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
