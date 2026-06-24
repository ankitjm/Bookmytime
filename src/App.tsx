import { NavLink, Route, Routes } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { fmtValue } from './market';
import { YouPage } from './pages/YouPage';
import { PeoplePage } from './pages/PeoplePage';
import { BookingsPage } from './pages/BookingsPage';

function TopBar() {
  const { myValue } = useStore();
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">⏱️</span>
        <span>
          Book<span className="brand-accent">My</span>Time
        </span>
      </div>
      <div className="top-value mono">✦ {fmtValue(myValue)}</div>
    </header>
  );
}

function BottomNav() {
  const { me, pendingCount } = useStore();
  return (
    <nav className="tabbar">
      <NavLink to="/people" className="tab">
        <span className="ic">👥</span>
        <span>People</span>
      </NavLink>

      <NavLink to="/" end className="tab center">
        <span className="you-orb">
          {me.avatar}
          {pendingCount > 0 && <span className="orb-badge">{pendingCount}</span>}
        </span>
        <span>You</span>
      </NavLink>

      <NavLink to="/bookings" className="tab">
        <span className="ic">📅</span>
        <span>Bookings</span>
      </NavLink>
    </nav>
  );
}

function Shell() {
  return (
    <div className="app">
      <TopBar />
      <Routes>
        <Route path="/" element={<YouPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="*" element={<YouPage />} />
      </Routes>
      <footer className="foot">
        BookMyTime is a friendly demo — people, values and requests are fictional.
      </footer>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
