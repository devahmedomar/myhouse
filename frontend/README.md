# Household Expenses Frontend

Angular 21 standalone frontend for the Household Expense Tracker. Arabic (RTL) by default, EGP currency.

## Run locally

Requires Node.js 20.19+, 22.12+, or 24+.

```bash
npm install
npm start
```

The dev API URL is `http://localhost:3000/api` (`src/environments/environment.ts`).

## Production build

```bash
npm run build
```

Output: `dist/household-expenses/browser`

Production uses `src/environments/environment.prod.ts` via `angular.json` file replacement.
Before deploying, replace the placeholder `https://YOUR-BACKEND.vercel.app/api` with the real deployed API URL.

`vercel.json` rewrites every path to `/index.html` so Angular Router works on refresh.

## Notes

- JWT is stored in `localStorage` under `token`; the auth guard and interceptor use it.
- `ng2-charts` 7 + `chart.js` 4 are used for the dashboard charts (`provideCharts` is registered in `app.config.ts`).
- Edit forms receive the selected transaction from router state / an in-memory cache because the API has no `GET /transactions/:id` endpoint.
