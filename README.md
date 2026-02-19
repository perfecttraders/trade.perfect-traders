# trade.perfect-traders

Production-ready React 18 + Vite frontend for **Perfect Traders**, configured for GitHub Pages deployment.

## Live URL

- GitHub Pages: `https://perfecttraders.github.io/trade.perfect-traders/`
- Future domain: `https://trade.perfect-traders.com`

## Tech stack

- React 18
- Vite 5
- React Router (`HashRouter`)
- GitHub Actions Pages deployment

## Routes

- `/#/login`
- `/#/signup`
- `/#/dashboard`
- `/#/admin`

## Features

- Signup page with phone, email, and Terms & Conditions checkbox.
- Login page.
- Trading dashboard with fake balance, live symbol simulation, buy/sell actions, and trade history.
- Admin UI for adding symbols, setting prices, managing users, and settings placeholder.
- Local storage persistence for mock users, active user, symbols, and trade history.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment details (GitHub Pages safe)

This project is configured to avoid common GitHub Pages issues:

- Correct Vite base path: `base: '/trade.perfect-traders/'`.
- Uses `HashRouter` to prevent direct-route 404s on static hosting.
- Build outputs to `dist/` with assets in `dist/assets/`.
- `public/favicon.svg` included and linked from `index.html`.
- GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys `dist` automatically (uses `npm ci` when a lockfile exists, otherwise `npm install`).
- Workflow adds `dist/404.html` SPA fallback and `dist/.nojekyll` for extra Pages reliability.

No manual path rewrites are required after cloning.
