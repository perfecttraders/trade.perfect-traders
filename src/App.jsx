import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const LOCAL_USERS_KEY = 'pt_users';
const LOCAL_ACTIVE_USER_KEY = 'pt_active_user';
const LOCAL_SYMBOLS_KEY = 'pt_symbols';
const LOCAL_HISTORY_KEY = 'pt_trade_history';

const DEFAULT_SYMBOLS = [
  { name: 'EURUSD', price: 1.0832 },
  { name: 'BTCUSD', price: 65210.54 },
  { name: 'XAUUSD', price: 2358.4 }
];

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function App() {
  const [users, setUsers] = useState(() => readStorage(LOCAL_USERS_KEY, []));
  const [activeUser, setActiveUser] = useState(() => readStorage(LOCAL_ACTIVE_USER_KEY, null));
  const [symbols, setSymbols] = useState(() => readStorage(LOCAL_SYMBOLS_KEY, DEFAULT_SYMBOLS));
  const [tradeHistory, setTradeHistory] = useState(() => readStorage(LOCAL_HISTORY_KEY, []));
  const [balance, setBalance] = useState(15000);

  useEffect(() => writeStorage(LOCAL_USERS_KEY, users), [users]);
  useEffect(() => writeStorage(LOCAL_ACTIVE_USER_KEY, activeUser), [activeUser]);
  useEffect(() => writeStorage(LOCAL_SYMBOLS_KEY, symbols), [symbols]);
  useEffect(() => writeStorage(LOCAL_HISTORY_KEY, tradeHistory), [tradeHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSymbols((prev) =>
        prev.map((symbol) => {
          const variance = symbol.name.includes('BTC') ? 75 : symbol.name.includes('XAU') ? 1.2 : 0.0015;
          const next = Number((symbol.price + (Math.random() - 0.5) * variance).toFixed(symbol.name.includes('BTC') ? 2 : 5));
          return { ...symbol, price: Math.max(next, 0.0001) };
        })
      );
    }, 1300);
    return () => clearInterval(timer);
  }, []);

  const actions = {
    signup: (data) => {
      setUsers((prev) => [...prev, data]);
      setActiveUser({ email: data.email, phone: data.phone });
    },
    login: (email) => {
      const user = users.find((u) => u.email === email);
      if (!user) return false;
      setActiveUser({ email: user.email, phone: user.phone });
      return true;
    },
    logout: () => setActiveUser(null),
    placeTrade: (symbolName, side) => {
      const symbol = symbols.find((item) => item.name === symbolName);
      if (!symbol) return;
      const record = {
        id: `PT-${Date.now()}`,
        symbol: symbol.name,
        side,
        price: symbol.price,
        time: new Date().toLocaleString()
      };
      setTradeHistory((prev) => [record, ...prev].slice(0, 50));
      const delta = side === 'BUY' ? -11.4 : 9.2;
      setBalance((prev) => Number((prev + delta).toFixed(2)));
    },
    addSymbol: (name, price) => setSymbols((prev) => [...prev, { name: name.toUpperCase(), price }]),
    setPrice: (name, price) =>
      setSymbols((prev) => prev.map((symbol) => (symbol.name === name ? { ...symbol, price } : symbol)))
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<SignupPage onSignup={actions.signup} users={users} />} />
      <Route path="/login" element={<LoginPage onLogin={actions.login} />} />
      <Route
        path="/dashboard"
        element={
          <Protected isAllowed={!!activeUser}>
            <DashboardPage
              activeUser={activeUser}
              symbols={symbols}
              balance={balance}
              history={tradeHistory}
              onTrade={actions.placeTrade}
              onLogout={actions.logout}
            />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected isAllowed={!!activeUser}>
            <AdminPage users={users} symbols={symbols} onAddSymbol={actions.addSymbol} onSetPrice={actions.setPrice} />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function Protected({ isAllowed, children }) {
  const location = useLocation();
  if (!isAllowed) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

function HeaderNav({ title }) {
  return (
    <header className="topbar card">
      <h1>{title}</h1>
      <nav className="top-links">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}

function SignupPage({ onSignup, users }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = data.get('phone')?.toString().trim();
    const email = data.get('email')?.toString().trim().toLowerCase();
    const termsAccepted = data.get('terms') === 'on';

    if (!termsAccepted) return setError('You must accept Terms & Conditions.');
    if (users.some((user) => user.email === email)) return setError('Email already registered. Please login.');

    onSignup({ phone, email, createdAt: Date.now() });
    navigate('/dashboard');
  };

  return (
    <main className="app-shell auth-shell">
      <section className="auth-card card">
        <HeaderNav title="Perfect Traders" />
        <h2>Create account</h2>
        <form onSubmit={submit} className="stack">
          <label>
            Phone number
            <input name="phone" required placeholder="+1 555 123 4567" type="tel" />
          </label>
          <label>
            Email
            <input name="email" required placeholder="you@perfecttraders.com" type="email" />
          </label>
          <label className="checkbox-row">
            <input name="terms" type="checkbox" />
            <span>Accept Terms & Conditions</span>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </form>
      </section>
    </main>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email')?.toString().trim().toLowerCase();
    if (!onLogin(email)) return setError('User not found. Please sign up first.');
    navigate('/dashboard');
  };

  return (
    <main className="app-shell auth-shell">
      <section className="auth-card card">
        <HeaderNav title="Perfect Traders" />
        <h2>Login</h2>
        <form onSubmit={submit} className="stack">
          <label>
            Email
            <input name="email" type="email" required placeholder="you@perfecttraders.com" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit">
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}

function DashboardPage({ activeUser, symbols, balance, history, onTrade, onLogout }) {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]?.name || '');

  useEffect(() => {
    if (!symbols.some((s) => s.name === selectedSymbol)) setSelectedSymbol(symbols[0]?.name || '');
  }, [symbols, selectedSymbol]);

  return (
    <main className="app-shell">
      <HeaderNav title="Trading Dashboard" />
      <section className="grid-layout">
        <article className="card">
          <h3>Account</h3>
          <p>{activeUser.email}</p>
          <p className="big-number">${balance.toLocaleString()}</p>
          <button className="btn" onClick={onLogout}>Logout</button>
        </article>

        <article className="card">
          <h3>Live symbols</h3>
          <ul className="price-list">
            {symbols.map((symbol) => (
              <li key={symbol.name}>
                <span>{symbol.name}</span>
                <strong>{symbol.price}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h3>Trade actions</h3>
          <label>
            Symbol
            <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)}>
              {symbols.map((symbol) => (
                <option key={symbol.name} value={symbol.name}>
                  {symbol.name}
                </option>
              ))}
            </select>
          </label>
          <div className="actions">
            <button className="btn btn-buy" onClick={() => onTrade(selectedSymbol, 'BUY')}>Buy</button>
            <button className="btn btn-sell" onClick={() => onTrade(selectedSymbol, 'SELL')}>Sell</button>
          </div>
        </article>

        <article className="card full">
          <h3>Trade history</h3>
          <TradeTable rows={history} />
        </article>
      </section>
    </main>
  );
}

function AdminPage({ users, symbols, onAddSymbol, onSetPrice }) {
  const [symbolName, setSymbolName] = useState('');
  const [symbolPrice, setSymbolPrice] = useState('');

  const symbolNames = useMemo(() => symbols.map((s) => s.name), [symbols]);

  return (
    <main className="app-shell">
      <HeaderNav title="Admin Panel" />
      <section className="grid-layout">
        <article className="card">
          <h3>Add symbols</h3>
          <input value={symbolName} placeholder="ETHUSD" onChange={(e) => setSymbolName(e.target.value.toUpperCase())} />
          <input value={symbolPrice} placeholder="3245.9" type="number" onChange={(e) => setSymbolPrice(e.target.value)} />
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!symbolName || !symbolPrice || symbolNames.includes(symbolName)) return;
              onAddSymbol(symbolName, Number(symbolPrice));
              setSymbolName('');
              setSymbolPrice('');
            }}
          >
            Add Symbol
          </button>
        </article>

        <article className="card">
          <h3>Set prices</h3>
          {symbols.map((symbol) => (
            <div key={symbol.name} className="inline-control">
              <span>{symbol.name}</span>
              <input
                type="number"
                value={symbol.price}
                onChange={(event) => onSetPrice(symbol.name, Number(event.target.value))}
              />
            </div>
          ))}
        </article>

        <article className="card full">
          <h3>Manage users</h3>
          <ul className="user-list">
            {users.length === 0 ? <li>No users registered yet.</li> : users.map((u) => <li key={u.email}>{u.email} • {u.phone}</li>)}
          </ul>
          <h3>Settings</h3>
          <p className="muted">API connection settings and role permissions can be wired here later.</p>
        </article>
      </section>
    </main>
  );
}

function TradeTable({ rows }) {
  if (!rows.length) return <p className="muted">No trades yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Symbol</th>
            <th>Side</th>
            <th>Price</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.symbol}</td>
              <td className={row.side === 'BUY' ? 'buy-text' : 'sell-text'}>{row.side}</td>
              <td>{row.price}</td>
              <td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
