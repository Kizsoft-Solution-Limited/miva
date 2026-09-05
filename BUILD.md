# Build week

Seven days. Public by day 7. Path: submit proof → agent verdict → investor decides.

## Where we are

| Day | Status |
| --- | --- |
| 1 Key + loop | done |
| 2 Search + PDF | done |
| 3 Demo polish | done |
| 4 Hardening | done |
| 5 Deploy | Coolify when week is done |
| 6 Package | done |
| 7 Freeze | next |

---

### Day 1 — key works ✅

Orbio key in `api/.env`. One real submit with a live verdict. Repo public.

### Day 2 — actually check stuff ✅

Web search on URL / metric / repo / PDF. PDF links through the file parser. No invented sources. Weak proof → needs more info. Show real source URLs.

### Day 3 — can demo cold ✅

Founder + investor screens readable. Verdict obvious. Three demo cases on Founder (strong / weak / thin). Errors that say what broke.

### Day 4 — don’t get embarrassed ✅

Rate-limit verify (8/min/IP) and decisions (30/min/IP). OpenRouter times out at 60s. Public http(s) only. `CORS_ORIGIN` can be a comma list. Don’t log the key.

### Day 5 — live link (Coolify, at the end)

Docker API (`api/Dockerfile`) + static Vue. Web uses `VITE_API_BASE_URL`. Health at `/api/health`. Host on Coolify after the week’s code is solid — set `CORS_ORIGIN`, build web against the API URL, then record a short happy-path video.

### Day 6 — package for judges ✅

README covers problem, product, Orbio bits. Verdict screen shows what ran (web search / PDF / structured JSON) plus expandable JSON. No TTS.

### Day 7 — stop

No new features after noon. Smoke-test twice. Public repo + live URL + short video. Submit how Orbio asks. Keep 1k+ $ORBIO in the wallet.
