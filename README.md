# MIVA

Investors keep asking founders "did you hit the milestone?" and then either trust the answer or dig through links themselves. MIVA sits in that gap.

Founder drops proof (URL, repo, doc excerpt, whatever). The agent checks what it can against live sources and returns a plain verdict: what checked out, what didn't, and whether it'd approve, reject, or ask for more. The investor still makes the call — we just make the check auditable.

Built for Orbio Build Week on an Orbio/OpenRouter key.

## Repo

| Folder | What |
| --- | --- |
| `api/` | NestJS API, Prisma, verification agent |
| `web/` | Vue (Vite) UI — founder submit + investor review |

## Run it

API:

```bash
cd api
cp .env.example .env
# paste OPENROUTER_API_KEY when you have it
npx prisma migrate dev
npm run start:dev
```

UI (other terminal):

```bash
cd web
npm run dev
```

- API: http://localhost:3000/api
- App: http://localhost:5173

No key yet? That's fine — submit still works and you get a cautious placeholder verdict so you can click through the flow. Live checks kick in once `OPENROUTER_API_KEY` is set.

## Env (`api/.env`)

```
DATABASE_URL=file:./dev.db
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Keep the key on the API side only. Don't put it in the Vue app.

Day-by-day build order (locked): see `BUILD.md`.
