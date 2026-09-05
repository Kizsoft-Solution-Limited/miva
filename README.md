# MIVA

Milestone Verification Agent.

Investors ask “did you hit the milestone?” and usually get a screenshot or a link. MIVA checks the proof against what it can verify and returns a verdict: confirmed, unconfirmed, and approve / reject / needs more info. The investor still decides.

Built for Orbio Build Week.

## Layout

- `api/` — NestJS, Prisma, verification agent (Orbio / OpenRouter)
- `web/` — Vue + Vite + Tailwind (founder + investor)

## Run locally

```bash
cd api
cp .env.example .env
# put OPENROUTER_API_KEY in .env
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
```

## Host (Coolify)

We ship on Coolify when the week’s build is done — not mid-flight.

**API** — Docker from `api/Dockerfile`

- Health: `GET /api/health`
- Env: `OPENROUTER_API_KEY`, `DATABASE_URL`, `CORS_ORIGIN` (your Coolify web URL), `PORT=3000`
- Start already runs `prisma migrate deploy`

**Web** — static build of `web/`

- Build: `npm ci && npm run build`
- Publish: `dist`
- Build env: `VITE_API_BASE_URL=https://<your-api-host>/api`
- SPA fallback to `index.html` (Coolify / nginx)

After both are up, open the web URL and run a Strong demo case. Drop a short screen recording link here when you have it.

Build plan: `BUILD.md`.
