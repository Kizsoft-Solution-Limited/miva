# Build week

Seven days. Path: submit proof → agent verdict → investor decides.

## Where we are

| Day | Status |
| --- | --- |
| 1 Key + loop | done |
| 2 Search + PDF | done |
| 3 Demo polish | done |
| 4 Hardening | done |
| 5 Deploy | done (live API + web) |
| 6 Package | done |
| 7 Freeze + submit | **video left** — then smoke-test and submit |

Almost finished. What’s left: short demo recording, last smoke, submit.

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

### Day 7 — freeze + submit

**Still to do**

- Shoot a short clip: Hard (NestJS repo + tag) → Weak or Thin → Investor decides
- Hit the live site once more and make sure nothing’s broken
- Submit the way Orbio wants
- Don’t let the wallet drop under 1k $ORBIO

No new features. Wording stays plain. Ship it.
