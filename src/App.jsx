import { useEffect, useState } from 'react';

const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD'];

const api = {
  login: async (payload) => {
    console.info('login payload', payload);
    return { ok: true };
  },
  updateProfile: async (payload) => {
    console.info('update profile payload', payload);
    return { ok: true };
  },
  createOrder: async (payload) => {
    console.info('order payload', payload);
    return { ok: true, id: `TRD-${Date.now()}` };
  }
};

const initialPrices = {
  EURUSD: 1.0832,
  GBPUSD: 1.2718,
  XAUUSD: 2358.4
};

function App() {
  const [auth, setAuth] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [profile, setProfile] = useState({
    name: 'Trader One',
    phone: '',
    email: ''
  });
  const [prices, setPrices] = useState(initialPrices);
  const [balance, setBalance] = useState(12500.23);
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [lotSize, setLotSize] = useState('0.10');
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        symbols.forEach((symbol) => {
          const movement = (Math.random() - 0.5) * (symbol === 'XAUUSD' ? 1.4 : 0.002);
          next[symbol] = Number((prev[symbol] + movement).toFixed(symbol === 'XAUUSD' ? 2 : 5));
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('phone')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const acceptedTerms = formData.get('terms') === 'on';

    if (!acceptedTerms) {
      setError('You must accept terms to create an account.');
      return;
    }

    await api.login({ phone, email });
    setProfile((prev) => ({ ...prev, phone, email }));
    setError('');
    setAuth(true);
  };

  const executeOrder = async (side) => {
    const lot = Number(lotSize);
    if (!lot || lot <= 0) {
      setError('Lot size must be greater than zero.');
      return;
    }

    const price = prices[selectedSymbol];
    const trade = {
      id: `TRD-${Math.floor(Math.random() * 900000 + 100000)}`,
      symbol: selectedSymbol,
      side,
      lot: lot.toFixed(2),
      price,
      openedAt: new Date().toLocaleString()
    };

    await api.createOrder(trade);
    setOpenTrades((prev) => [trade, ...prev].slice(0, 8));
    setTradeHistory((prev) => [trade, ...prev].slice(0, 12));
    const pnlImpact = (side === 'BUY' ? -1 : 1) * lot * 4.2;
    setBalance((prev) => Number((prev + pnlImpact).toFixed(2)));
    setError('');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = {
      name: formData.get('name')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || ''
    };

    await api.updateProfile(next);
    setProfile(next);
    setError('Profile updated successfully.');
  };

  if (!auth) {
    return (
      <main className="app-shell auth-shell">
        <section className="card auth-card">
          <h1>Perfect Traders</h1>
          <p className="muted">Create your account and access the live market dashboard.</p>

          <form onSubmit={handleAuth} className="stack">
            <label>
              Phone number
              <input name="phone" type="tel" placeholder="+1 555 123 4567" required />
            </label>

            <label>
              Email
              <input name="email" type="email" placeholder="you@example.com" required />
            </label>

            <label className="checkbox-row">
              <input name="terms" type="checkbox" />
              <span>I accept all terms and conditions.</span>
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn btn-primary">
              Create account
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar card">
        <h1>Perfect Traders</h1>
        <nav className="nav-tabs">
          <button
            className={activePage === 'dashboard' ? 'tab active' : 'tab'}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={activePage === 'settings' ? 'tab active' : 'tab'}
            onClick={() => setActivePage('settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      {error && <p className="error global-error">{error}</p>}

      {activePage === 'dashboard' ? (
        <section className="grid-layout">
          <article className="card balance-card">
            <h2>Balance</h2>
            <p className="balance-value">${balance.toLocaleString()}</p>
            <small className="muted">Account: Demo / USD</small>
          </article>

          <article className="card prices-card">
            <h2>Live prices</h2>
            <ul className="price-list">
              {symbols.map((symbol) => (
                <li key={symbol}>
                  <span>{symbol}</span>
                  <strong>{prices[symbol]}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="card trade-card">
            <h2>Trading UI</h2>
            <label>
              Symbol
              <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
                {symbols.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </label>

            <p className="market-price">
              Market: <strong>{prices[selectedSymbol]}</strong>
            </p>

            <label>
              Lot size
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={lotSize}
                onChange={(event) => setLotSize(event.target.value)}
              />
            </label>

            <div className="actions">
              <button className="btn btn-buy" onClick={() => executeOrder('BUY')}>
                Buy
              </button>
              <button className="btn btn-sell" onClick={() => executeOrder('SELL')}>
                Sell
              </button>
            </div>
          </article>

          <article className="card open-trades-card">
            <h2>Open trades</h2>
            <Table rows={openTrades} emptyLabel="No open trades yet" />
          </article>

          <article className="card history-card">
            <h2>Trade history</h2>
            <Table rows={tradeHistory} emptyLabel="No trade history yet" />
          </article>
        </section>
      ) : (
        <section className="settings-layout card">
          <h2>Settings</h2>
          <p className="muted">Update your profile details and contact preferences.</p>

          <form className="stack" onSubmit={saveProfile}>
            <label>
              Full name
              <input name="name" type="text" defaultValue={profile.name} required />
            </label>
            <label>
              Phone number
              <input name="phone" type="tel" defaultValue={profile.phone} required />
            </label>
            <label>
              Email
              <input name="email" type="email" defaultValue={profile.email} required />
            </label>

            <button type="submit" className="btn btn-primary">
              Save profile
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function Table({ rows, emptyLabel }) {
  if (!rows.length) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Lot</th>
            <th>Price</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((trade) => (
            <tr key={trade.id}>
              <td>{trade.id}</td>
              <td>{trade.symbol}</td>
              <td className={trade.side === 'BUY' ? 'buy-text' : 'sell-text'}>{trade.side}</td>
              <td>{trade.lot}</td>
              <td>{trade.price}</td>
              <td>{trade.openedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
