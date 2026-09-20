# Build week

Seven days. Path: submit proof → agent verdict → investor decides.

## Where we are

| Day | Status |
| --- | --- |
| 1 Key + loop | done |
| 2 Search + PDF | done |
| 3 Demo polish | done |
| 4 Hardening | done |
| 5 Deploy | done |
| 6 Package | done |
| 7 Freeze + submit | done |


Week’s built. Demo’s recorded. Api + web unit/e2e are green. I smoke-checked the live path. Ready to ship.

---

### Day 1 — key works ✅

Orbio key in `api/.env`. One real submit with a live verdict. Repo public.

### Day 2 — actually check stuff ✅

Web search on URL / metric / repo / PDF. PDF links through the file parser. No invented sources. Weak proof → needs more info. Show real source URLs.

### Day 3 — can demo cold ✅

Founder + investor screens. Verdict obvious. Demo cases: Hard (repo + release), Weak, Thin, Strong — tap to fill. Errors that say what broke. Sign in: Founder submits, Investor decides.

### Day 4 — don’t get embarrassed ✅

Rate-limit verify and decisions. Auth rate limit. OpenRouter times out at 60s. Public http(s) only. GitHub HTML fallback if the API blocks. Don’t log the key.

### Day 5 — live link ✅

API + web are up. CORS set. Health at `/api/health`. (Coolify was the original plan; live host is fine.)

### Day 6 — package for judges ✅

README covers what it is, how to run, Orbio bits. Verdict shows what ran + expandable JSON. No TTS.

### Day 7 — freeze + submit ✅

- Demo video (Hard → Weak/Thin → investor decides)
- Tests: `api` unit + e2e, `web` unit — all passing
- Live smoke: submit → verdict → decide still works
