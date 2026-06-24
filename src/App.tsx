import { NavLink, Route, Routes } from 'react-router-dom';
import { MarketProvider, useMarket } from './store';
import { TickerTape } from './components/TickerTape';
import { fmtMoney } from './market';
import { MarketPage } from './pages/MarketPage';
import { TradePage } from './pages/TradePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { BookingsPage } from './pages/BookingsPage';

function AccountStrip() {
  const { portfolio, netWorth } = useMarket();
  return (
    <div className="account">
      <div className="acct-stat">
        <div className="label">Buying Power</div>
        <div className="val mono">TIME$ {fmtMoney(portfolio.cash)}</div>
      </div>
      <div className="acct-stat">
        <div className="label">Net Worth</div>
        <div className="val mono">TIME$ {fmtMoney(netWorth)}</div>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="logo">⏱️</span>
          <span>
            Time<span style={{ color: 'var(--up)' }}>Market</span> <small>EXCHANGE</small>
          </span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>
            Market
          </NavLink>
          <NavLink to="/portfolio">Portfolio</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
        </nav>
        <AccountStrip />
      </header>
      <TickerTape />
      <Routes>
        <Route path="/" element={<MarketPage />} />
        <Route path="/trade/:id" element={<TradePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="*" element={<MarketPage />} />
      </Routes>
      <footer
        style={{
          borderTop: '1px solid var(--line)',
          padding: '16px 22px',
          color: 'var(--muted)',
          fontSize: 12,
          textAlign: 'center',
        }}
      >
        TimeMarket is a simulated exchange for entertainment. Prices, people and timeslots are
        fictional. No real hours were harmed. · Paper-trading with TIME$.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MarketProvider>
      <Shell />
    </MarketProvider>
  );
}
