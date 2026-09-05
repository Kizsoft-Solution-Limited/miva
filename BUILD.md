# Build week — 7 days (LOCKED)

Do not reshuffle this plan mid-week unless we explicitly change it. Contest window is 7 days once approved. Project public by day 7. Demo path only: submit proof → agent verdict → investor decides.

## Status

- Day 1: done (live Orbio key + end-to-end verdict)
- Day 2: done (OpenRouter web search + PDF plugin path + stricter prompts)

## Already done (before the clock)

- Nest API + Prisma + Vue UI scaffold
- Verdict schema, basic agent loop, founder/investor screens
- Cursor rules local only (not in git)

## Day 1 — Wire the key + prove the loop ✅

- Claim Orbio $100 key → `api/.env` as `OPENROUTER_API_KEY`
- Run a real verification (URL + text claim) end to end
- Fix anything broken in submit → verdict → decision
- Push a public repo (GitHub) even if rough

**Done when:** one live milestone shows a real agent verdict in the UI

## Day 2 — Make verification actually check things ✅

- Turn on OpenRouter web search for URL/press/metric claims
- PDF / doc path: accept link or upload, extract text, feed the agent
- Tighten prompts: no invented sources; weak evidence → `needs_more_info`
- Persist and show source URLs in confirmed/unconfirmed

**Done when:** a good claim confirms with citations; a weak claim doesn’t fake-approve

## Day 3 — Demo polish (investor story)

- Clean founder form + investor queue/detail (readable, not pretty-for-its-own-sake)
- Verdict card: recommendation, confirmed, unconfirmed, reasoning — obvious in one screen
- 2–3 canned demo cases (strong / weak / missing proof)
- Basic error states (bad URL, timeout, missing key message)

**Done when:** you can demo in under 2 minutes without apologizing

## Day 4 — Hardening

- Rate-limit verify endpoint; timeouts on outbound fetches
- Validate proof URLs (block localhost / weird schemes)
- CORS + env for a real deploy host
- Logging that never prints the API key

**Done when:** you wouldn’t be embarrassed if judges hammer submit

## Day 5 — Deploy + public link

- Deploy API + web (Railway / Fly / Render / Vercel — whatever’s fastest)
- Point `CORS_ORIGIN` at the live UI
- README: what it is, how to try it, where the Orbio key is used
- Record a 60–90s loom/screen take of the happy path

**Done when:** a stranger can open the URL and run a verification

## Day 6 — Contest packaging

- One-pager in README: problem → what MIVA does → Orbio features used
- Call out multi-model / search / PDF / structured JSON in the product (not just README)
- Optional: light TTS summary of a verdict (only if Day 1–5 are solid)
- Fix bugs from deploy, not new features

**Done when:** judges can see Orbio in the product without hunting

## Day 7 — Freeze + submit

- No new features after noon
- Smoke-test live demo twice
- Confirm repo is public, README has live link + short video
- Submit whatever Orbio asks for (Telegram / form / dashboard)
- Keep 1k+ $ORBIO in the wallet through the week

**Done when:** public link works and you stop touching code

## Don’t do this week

- Escrow, vesting, wallets, full funding platform
- Auth SSO / multi-tenant SaaS
- Rewriting Nest or Vue “properly”
- Checkbox features that don’t help the 2-minute demo
