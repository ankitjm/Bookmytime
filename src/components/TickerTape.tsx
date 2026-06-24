import { PEOPLE } from '../data';
import { fmtMoney } from '../market';
import { useMarket } from '../store';

/** The scrolling exchange tape across the top of the app. */
export function TickerTape() {
  const { quotes } = useMarket();
  const items = PEOPLE.map((p) => {
    const q = quotes[p.id];
    const up = q.changePct >= 0;
    return (
      <span className="tape-item" key={p.id}>
        <span className="sym">{p.ticker}</span>
        <span className="mono">{fmtMoney(q.price)}</span>
        <span className={up ? 'up' : 'down'}>
          <span className="arrow">{up ? '▲' : '▼'}</span> {Math.abs(q.changePct).toFixed(2)}%
        </span>
      </span>
    );
  });
  // Duplicate the run so the marquee loops seamlessly.
  return (
    <div className="tape">
      <div className="tape-track">
        {items}
        {items}
      </div>
    </div>
  );
}
