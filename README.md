# MIVA

Milestone Verification Agent — trust layer before funding moves.

Founders claim they hit a milestone. Investors either believe them or dig through links. MIVA sits in between: founder submits proof, the agent checks what it can, investor gets a verdict (approve / reject / needs more info) and still makes the call.

Built for Orbio Build Week on an Orbio key (OpenRouter).

## What it uses from Orbio

| Bit | Where |
| --- | --- |
| Multi-model / chat | Verification agent |
| Web search | URL, metric, repo, PDF claims |
| PDF read | Proof type PDF + public PDF URL |
| Structured JSON | Verdict schema every run |

You can see that on the investor verdict screen (“This check used …”) and in the expandable JSON.

## Layout

- `api/` — NestJS, Prisma, agent
- `web/` — Vue (founder submit + investor review)

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
```

## Host (Coolify)

When the week’s build is done:

- API: Docker from `api/Dockerfile`, health `GET /api/health`
- Web: build `web/` with `VITE_API_BASE_URL=https://<api>/api`, publish `dist`
- Set `CORS_ORIGIN` to the web URL

## Demo

Founder page has three cases: Strong (live URL), Weak (no proof), Thin (bad link). Run Strong → open the verdict → decide.

Build plan: `BUILD.md`.
