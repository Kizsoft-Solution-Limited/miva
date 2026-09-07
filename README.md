# MIVA

Milestone Verification Agent. Founder submits proof, the agent checks what it can, investor gets a verdict and still decides.

Built for Orbio Build Week (Orbio key = OpenRouter).

## Orbio bits in use

| Bit | Where |
| --- | --- |
| Multi-model / chat | Verification agent |
| Web search | URL, metric, repo, PDF claims |
| PDF read | PDF proof + public PDF URL |
| Structured JSON | Verdict every run |

Shows on the verdict screen (“This check used …”) and in the expandable JSON.

## Layout

- `api/` — NestJS, Prisma, agent
- `web/` — Vue (submit + review)

## Run locally

```bash
cd api
cp .env.example .env
# OPENROUTER_API_KEY=...
npx prisma migrate dev
npm run start:dev
```

```bash
cd web
npm run dev
```

- API: http://localhost:3000/api
- App: http://localhost:5173

## Env (API)

```
DATABASE_URL=file:./dev.db
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=3000
CORS_ORIGIN=http://localhost:5173
AUTH_SECRET=change-me
```

## Host

- API: Docker from `api/Dockerfile`, health `GET /api/health`
- Web: build with `VITE_API_BASE_URL` + `VITE_SITE_URL`, set `CORS_ORIGIN` to the web URL

## Demo

Open Founder. Tap **Hard** (NestJS repo + release) to fill the form. Weak / Thin for bad proof. Strong is a simple live URL. Founder submits, Investor decides.

Build plan: `BUILD.md`.

## Auth

**/login** — email + password. Pick Founder or Investor when you create the account. Session is an httpOnly cookie.

Set `AUTH_SECRET` on the API.
