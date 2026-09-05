# MIVA

Milestone Verification Agent.

Investors ask “did you hit the milestone?” and usually get a screenshot or a link. MIVA checks the proof against what it can verify and returns a verdict: confirmed, unconfirmed, and approve / reject / needs more info. The investor still decides.

Built for Orbio Build Week.

## Layout

- `api/` — NestJS, Prisma, verification agent (Orbio / OpenRouter)
- `web/` — Vue + Vite + Tailwind (founder + investor)

## Run

```bash
cd api
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

```bash
cd web
npm run dev
```

- API: http://localhost:3000/api
- App: http://localhost:5173

## Env

`api/.env`:

```
DATABASE_URL=file:./dev.db
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Build plan: `BUILD.md`.
