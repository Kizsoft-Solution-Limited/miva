# MIVA

Milestone Verification Agent. Founder submits proof, the agent checks what it can, investor gets a verdict and still decides.

Built for Orbio Build Week (Orbio key = OpenRouter).

## Architecture

- `api/` — NestJS + Prisma. Controllers stay thin; services run verification. Probes for URL / GitHub / PDF / on-chain live in `api/src/lib/`. Orbio (OpenRouter) only from the API.
- `web/` — Vue 3 + Pinia. Submit and review screens call the API. No secrets in the client.
- Flow: submit proof → agent verdict → investor decide.

## Orbio bits in use

| Bit | Where |
| --- | --- |
| Multi-model / chat | Verification agent |
| Web search | URL, metric, repo, PDF claims |
| PDF read | PDF proof + public PDF URL |
| Structured JSON | Verdict every run |

Shows on the verdict screen (“This check used …”) and in the expandable JSON.

## Run locally

```bash
cd api
cp .env.example .env
# put OPENAI_API_KEY in .env (Orbio key)
npx prisma migrate dev
npm run start:dev
```

```bash
cd web
cp .env.example .env
npm run dev
```

- API: http://localhost:3000/api
- App: http://localhost:5173

## Env

Copy `api/.env.example` → `api/.env`. Main knobs:

```
DATABASE_URL=file:./dev.db
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.orbio.so/api/v1
PORT=3000
CORS_ORIGIN=http://localhost:5173
AUTH_SECRET=change-me
```

Optional: `GITHUB_TOKEN`, `ETH_RPC_URL`, `COOKIE_SAMESITE`. Web: `VITE_API_BASE_URL`, `VITE_SITE_URL` (see `web/.env.example`).

## Testing

```bash
cd api && npm test && npm run test:e2e
cd web && npm test
```

Coverage floors: `npm run test:cov` in each package. Format check: `npm run format:check`. Orbio is mocked in tests — no live key needed. CI runs lint, format, tests, and build on every push (`.github/workflows/ci.yml`).

## Host

- API: Docker from `api/Dockerfile`, health `GET /api/health`
- Web: build with `VITE_API_BASE_URL` + `VITE_SITE_URL`, set `CORS_ORIGIN` to the web URL

## Demo

Open Founder. Tap **Hard** (NestJS repo + release) to fill the form. Weak / Thin for bad proof. Strong is a simple live URL. Founder submits, Investor decides.

Build plan: `BUILD.md`.

## Auth

**/login** — email + password. Pick Founder or Investor when you create the account. Session is an httpOnly cookie.

Set `AUTH_SECRET` on the API.
