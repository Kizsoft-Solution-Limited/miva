# Build week

Seven days. Public by day 7. Path: submit proof → agent verdict → investor decides.

## Where we are

| Day | Status |
| --- | --- |
| 1 Key + loop | done |
| 2 Search + PDF | done |
| 3 Demo polish | done |
| 4 Hardening | done |
| 5 Deploy | next |
| 6 Package | |
| 7 Freeze | |

---

### Day 1 — key works ✅

Orbio key in `api/.env`. One real submit with a live verdict. Repo public.

### Day 2 — actually check stuff ✅

Web search on URL / metric / repo / PDF. PDF links through the file parser. No invented sources. Weak proof → needs more info. Show real source URLs.

### Day 3 — can demo cold ✅

Founder + investor screens readable. Verdict obvious. Three demo cases on Founder (strong / weak / thin). Errors that say what broke.

### Day 4 — don’t get embarrassed ✅

Rate-limit verify (8/min/IP) and decisions (30/min/IP). OpenRouter times out at 60s. Public http(s) only. `CORS_ORIGIN` can be a comma list. Don’t log the key.

### Day 5 — live link

Deploy API + web. Set `CORS_ORIGIN`. README with how to try it. Short screen recording of the happy path.

### Day 6 — package for judges

README: problem, what MIVA does, Orbio bits we use. Show search / PDF / structured JSON in the product. Bugs only after that.

### Day 7 — stop

No new features after noon. Smoke-test twice. Public repo + live URL + short video. Submit how Orbio asks. Keep 1k+ $ORBIO in the wallet.
