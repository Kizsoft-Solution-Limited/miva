# Build week

Seven days. Public by day 7. One path only: submit proof → agent verdict → investor decides.

Don’t reshuffle this list mid-week unless we agree to.

## Where we are

| Day | Status |
| --- | --- |
| 1 Key + loop | done |
| 2 Search + PDF | done |
| 3 Demo polish | done |
| 4 Hardening | next |
| 5 Deploy | |
| 6 Package | |
| 7 Freeze | |

Scaffold (Nest, Vue, Prisma, verdict schema) was ready before the clock started. Cursor rules stay local — not in git.

---

### Day 1 — key works ✅

Claim Orbio credits → `OPENROUTER_API_KEY` in `api/.env`. One real submit that returns a live verdict. Repo public even if rough.

### Day 2 — actually check stuff ✅

Web search on URL/metric/repo/PDF claims. PDF link goes through the file parser. No invented sources. Weak proof → needs more info, not a fake approve. Show real source URLs.

### Day 3 — can demo cold ✅

Founder + investor screens readable. Verdict obvious in one glance. Three demo cases on the founder page (strong / weak / thin). Errors that say what broke.

### Day 4 — don’t get embarrassed

Rate-limit verify. Timeouts. Block localhost / weird URLs. CORS ready for a real host. Never log the API key.

### Day 5 — live link

Ship API + web somewhere fast. Fix `CORS_ORIGIN`. README with how to try it. 60–90s screen recording of the happy path.

### Day 6 — package for judges

README: problem, what MIVA does, which Orbio bits we use. Make search / PDF / structured JSON visible in the product. Bugfixes only. TTS only if everything else is solid.

### Day 7 — stop

No new features after noon. Smoke-test twice. Public repo + live URL + short video. Submit however Orbio wants. Keep 1k+ $ORBIO in the wallet.

---

## Out of scope

Escrow, vesting, wallets, “full platform”, SSO, rewriting Nest/Vue for aesthetics, anything that doesn’t help a 2-minute demo.
