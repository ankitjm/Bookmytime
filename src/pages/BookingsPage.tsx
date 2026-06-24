import { Link } from 'react-router-dom';
import { PEOPLE } from '../data';
import { useMarket } from '../store';

const byId = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));

export function BookingsPage() {
  const { portfolio, completeBooking } = useMarket();
  const bookings = portfolio.bookings;

  const upcoming = bookings.filter((b) => b.status === 'SCHEDULED');
  const past = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>My Bookings</h1>
          <p>Hours you've redeemed into real, scheduled meetings.</p>
        </div>
        <span className="pill">{upcoming.length} upcoming</span>
      </div>

      {bookings.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="big">📅</div>
            No bookings yet. Own an hour, then hit{' '}
            <strong style={{ color: 'var(--text)' }}>Book the hour</strong> on any trade page to
            schedule it.
            <div style={{ marginTop: 14 }}>
              <Link className="trade-btn" to="/" style={{ display: 'inline-block' }}>
                Browse the floor
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Upcoming</h3>
            {upcoming.length === 0 ? (
              <div className="empty" style={{ padding: 26 }}>
                Nothing scheduled.
              </div>
            ) : (
              upcoming.map((b) => {
                const p = byId[b.personId];
                const dt = new Date(b.when);
                return (
                  <div className="booking" key={b.id}>
                    <div className="avatar">{p.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {p.name} <span style={{ color: 'var(--muted)' }}>· {p.ticker}</span>
                      </div>
                      <div className="when">
                        {dt.toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        ·{' '}
                        {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                        {b.topic}
                      </div>
                    </div>
                    <span className="badge sched">Scheduled</span>
                    <button className="link-btn" onClick={() => completeBooking(b.id)}>
                      Mark complete
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {past.length > 0 && (
            <div className="card">
              <h3>Past</h3>
              {past.map((b) => {
                const p = byId[b.personId];
                const dt = new Date(b.when);
                return (
                  <div className="booking" key={b.id}>
                    <div className="avatar">{p.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {p.name} <span style={{ color: 'var(--muted)' }}>· {p.ticker}</span>
                      </div>
                      <div className="when">
                        {dt.toLocaleDateString()} ·{' '}
                        {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                        {b.topic}
                      </div>
                    </div>
                    <span className="badge done">Completed</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
