<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="land">
    <section id="top" class="home-hero" aria-labelledby="home-brand">
      <div class="home-hero__grid" aria-hidden="true" />
      <div class="home-hero__wash" aria-hidden="true" />
      <div class="home-hero__orb" aria-hidden="true" />
      <div class="home-hero__scan" aria-hidden="true" />

      <div class="home-shell home-hero__inner">
        <div class="home-hero__copy">
          <p class="home-live">
            <span class="home-live__dot" aria-hidden="true" />
            orbio · verification live
          </p>

          <div class="home-brand-row">
            <img src="/logo.png" alt="" width="76" height="76" class="home-brand-mark" />
            <h1 id="home-brand" class="home-brand">MIVA</h1>
          </div>

          <p class="home-headline">Trust layer for milestone capital.</p>

          <p class="home-lede">
            Founders submit proof. The agent checks live sources and returns a
            sealed JSON verdict. You still decide if capital moves.
          </p>

          <div class="home-cta">
            <RouterLink to="/founder" class="home-btn home-btn--primary">
              Launch verify
            </RouterLink>
            <a href="#protocol" class="home-btn home-btn--ghost">Why it exists</a>
          </div>

          <div class="land-trust" aria-label="Stack">
            <span>orbio agent</span>
            <span>auditable JSON</span>
            <span>no custody</span>
          </div>
        </div>

        <aside class="verdict-panel" aria-label="Example verdict">
          <div class="verdict-panel__bar">
            <span class="verdict-panel__dots" aria-hidden="true"><i /><i /><i /></span>
            <span class="font-mono text-[11px] tracking-wide text-[var(--signal-dim)]">
              miva://verdict · sample
            </span>
            <span class="verdict-panel__status">approve</span>
          </div>
          <div class="verdict-panel__body">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--signal-dim)]">
              Claim
            </p>
            <p class="mt-2 text-[15px] leading-snug text-[var(--night-fg)]">
              billspot.co is live and serving the product site.
            </p>

            <div class="mt-5">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-[10px] uppercase tracking-wider text-[var(--signal-dim)]">
                  confidence
                </span>
                <span class="font-mono text-[12px] text-[var(--signal)]">0.86</span>
              </div>
              <div class="land-meter" aria-hidden="true">
                <span class="land-meter__fill" style="width: 86%" />
              </div>
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div class="verdict-chip verdict-chip--ok">
                <span class="font-mono text-[10px] uppercase tracking-wider text-[var(--signal)]">
                  confirmed
                </span>
                <p class="mt-1 text-sm text-[var(--night-fg)]">Public URL resolves · TLS ok</p>
              </div>
              <div class="verdict-chip">
                <span class="font-mono text-[10px] uppercase tracking-wider text-[var(--signal-dim)]">
                  source
                </span>
                <p class="mt-1 truncate font-mono text-xs text-[var(--signal)]">
                  https://billspot.co
                </p>
              </div>
            </div>

            <div class="mt-6 border-t border-white/10 pt-5">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--signal-dim)]">
                Agent stack
              </p>
              <ul class="mt-3 flex flex-wrap gap-2">
                <li class="orbio-tag">web search</li>
                <li class="orbio-tag">structured JSON</li>
                <li class="orbio-tag">Orbio key</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <div class="land-ticker" aria-hidden="true">
      <div class="land-ticker__track">
        <span>VERIFY</span><span>·</span>
        <span>ATTEST</span><span>·</span>
        <span>DECIDE</span><span>·</span>
        <span>ORBIO</span><span>·</span>
        <span>WEB SEARCH</span><span>·</span>
        <span>PDF READ</span><span>·</span>
        <span>JSON VERDICT</span><span>·</span>
        <span>NO BLACK BOX</span><span>·</span>
        <span>VERIFY</span><span>·</span>
        <span>ATTEST</span><span>·</span>
        <span>DECIDE</span><span>·</span>
        <span>ORBIO</span><span>·</span>
        <span>WEB SEARCH</span><span>·</span>
        <span>PDF READ</span><span>·</span>
        <span>JSON VERDICT</span><span>·</span>
        <span>NO BLACK BOX</span><span>·</span>
      </div>
    </div>

    <section class="land-rail" aria-label="Product signals">
      <div class="home-shell land-rail__grid">
        <div>
          <p class="font-mono">signal</p>
          <p class="land-rail__val">live sources</p>
          <p class="land-rail__sub">Web + PDF when the claim needs them</p>
        </div>
        <div>
          <p class="font-mono">output</p>
          <p class="land-rail__val">schema JSON</p>
          <p class="land-rail__sub">Confirmed, unconfirmed, recommendation</p>
        </div>
        <div>
          <p class="font-mono">control</p>
          <p class="land-rail__val">human final</p>
          <p class="land-rail__sub">Approve, reject, or ask for more</p>
        </div>
      </div>
    </section>

    <section id="protocol" class="land-manifesto" aria-labelledby="protocol-heading">
      <div class="land-manifesto__glow" aria-hidden="true" />
      <div class="home-shell">
        <p class="land-manifesto__eye font-mono">01 · why miva exists</p>
        <h2 id="protocol-heading" class="land-manifesto__title">
          Capital still moves on
          <em>vibes and screenshots.</em>
        </h2>
        <p class="land-manifesto__lede">
          In crypto and early-stage funding, “we shipped” often means a Discord dump,
          a Notion link, or a dashboard nobody re-checked. That’s not an attestation —
          that’s hope with a URL.
        </p>

        <div class="land-versus">
          <article class="land-versus__card land-versus__card--before">
            <p class="font-mono">before</p>
            <h3>Trust theater</h3>
            <ul>
              <li>Claim dropped in a chat</li>
              <li>One person “looks fine”</li>
              <li>No sealed record of what was checked</li>
              <li>Money moves on memory</li>
            </ul>
          </article>
          <div class="land-versus__arrow" aria-hidden="true">
            <span class="land-versus__arrow-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12h14m0 0l-6-6m6 6l-6 6"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
          <article class="land-versus__card land-versus__card--after">
            <p class="font-mono">with miva</p>
            <h3>Verification pass</h3>
            <ul>
              <li>Proof submitted once</li>
              <li>Agent hits live sources</li>
              <li>Confirmed / unconfirmed with URLs</li>
              <li>Human still signs the release</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section id="interface" class="land-band land-band--void" aria-labelledby="iface-heading">
      <div class="home-shell">
        <div class="home-section__head">
          <p class="eyebrow text-[var(--signal)]">02 · interface</p>
          <h2 id="iface-heading" class="home-section__title text-[var(--night-fg)]">
            Operator desk, not a brochure.
          </h2>
          <p class="mt-3 max-w-2xl text-[var(--signal-dim)]">
            Founder console on the left. Investor verdict on the right.
            Same JSON shape every run.
          </p>
        </div>

        <div class="land-desk">
          <article class="land-window land-window--glass">
            <header class="land-window__bar">
              <span class="font-mono">founder · submit</span>
              <span class="land-window__pill">proof</span>
            </header>
            <div class="land-window__body">
              <label class="land-field land-field--dark">
                <span>Claim</span>
                <div>Public site is live at billspot.co</div>
              </label>
              <label class="land-field land-field--dark">
                <span>Proof URL</span>
                <div class="font-mono text-[var(--signal)]">https://billspot.co</div>
              </label>
              <div class="land-window__actions">
                <span class="land-fake-btn land-fake-btn--ok">Run verification</span>
                <span class="font-mono text-[11px] text-[var(--signal-dim)]">orbio · searching…</span>
              </div>
            </div>
          </article>

          <article class="land-window land-window--dark">
            <header class="land-window__bar">
              <span class="font-mono">investor · verdict</span>
              <span class="land-window__pill land-window__pill--ok">approve</span>
            </header>
            <div class="land-window__body">
              <p class="font-mono text-[11px] uppercase tracking-wider text-[var(--signal-dim)]">
                confirmed
              </p>
              <ul class="land-findings">
                <li>Site responds 200 over HTTPS</li>
                <li>Title matches product claim</li>
              </ul>
              <p class="mt-4 font-mono text-[11px] uppercase tracking-wider text-[var(--signal-dim)]">
                unconfirmed
              </p>
              <ul class="land-findings land-findings--dim">
                <li>Traffic / revenue not in proof</li>
              </ul>
              <div class="land-window__actions mt-5">
                <span class="land-fake-btn land-fake-btn--ok">Approve release</span>
                <span class="land-fake-btn land-fake-btn--ghost">Need more info</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="land-band land-band--ink2" aria-labelledby="flow-heading">
      <div class="home-shell">
        <div class="home-section__head home-section__head--center">
          <p class="eyebrow text-[var(--signal)]">03 · pipeline</p>
          <h2 id="flow-heading" class="home-section__title text-[var(--night-fg)]">
            Submit. Attest. Decide.
          </h2>
          <p class="mt-3 max-w-xl text-[var(--signal-dim)] mx-auto">
            Three clear handoffs. Nothing invented in the middle.
          </p>
        </div>

        <ol class="flow-pipe">
          <li class="flow-node flow-node--night">
            <div class="flow-node__badge" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="flow-node__verb font-mono">01 · submit</p>
            <h3 class="flow-node__title">Founder posts proof</h3>
            <p class="flow-node__text">
              URL, repo, PDF upload, or excerpt — bound to the milestone claim.
            </p>
          </li>

          <li class="flow-connector flow-connector--night" aria-hidden="true">
            <span class="flow-connector__line" />
            <span class="flow-connector__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h12m0 0l-5-5m5 5l-5 5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </li>

          <li class="flow-node flow-node--hot flow-node--night">
            <div class="flow-node__badge" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="flow-node__verb font-mono">02 · attest</p>
            <h3 class="flow-node__title">Agent verifies</h3>
            <p class="flow-node__text">
              Live web + docs. Gaps stay unconfirmed — never fabricated.
            </p>
          </li>

          <li class="flow-connector flow-connector--night" aria-hidden="true">
            <span class="flow-connector__line" />
            <span class="flow-connector__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h12m0 0l-5-5m5 5l-5 5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </li>

          <li class="flow-node flow-node--night">
            <div class="flow-node__badge" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="flow-node__verb font-mono">03 · decide</p>
            <h3 class="flow-node__title">Investor signs</h3>
            <p class="flow-node__text">
              Approve, reject, or demand more. Custody stays on your rails.
            </p>
          </li>
        </ol>
      </div>
    </section>

    <section id="orbio" class="home-orbio" aria-labelledby="orbio-heading">
      <div class="home-shell home-orbio__inner">
        <div>
          <p class="eyebrow text-[var(--signal)]">04 · orbio</p>
          <h2 id="orbio-heading" class="home-section__title text-[var(--night-fg)]">
            Built where the agent can prove its work.
          </h2>
          <p class="mt-4 max-w-lg text-[var(--signal-dim)]">
            Orbio key drives search, document read, and schema-locked JSON.
            Every verdict lists what fired — open books for the investor.
          </p>
          <ul class="land-orbio-list font-mono">
            <li><span>01</span> multi-model chat</li>
            <li><span>02</span> live web search</li>
            <li><span>03</span> PDF / file parse</li>
            <li><span>04</span> structured outputs</li>
          </ul>
        </div>
        <div class="land-term land-term--live" aria-hidden="true">
          <div class="land-term__bar">
            <span>session</span>
            <span class="land-term__pulse">
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                <circle cx="4" cy="4" r="4" fill="currentColor" />
              </svg>
              running
            </span>
          </div>
          <p class="font-mono text-[11px] text-[var(--signal-dim)]">miva@orbio ~ verify</p>
          <p class="font-mono text-sm text-[var(--night-fg)] mt-2">
            <span class="text-[var(--signal)]">$</span> openrouter · web_search · pdf · json_schema
          </p>
          <p class="font-mono text-sm text-[var(--signal-dim)] mt-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h12m0 0l-5-5m5 5l-5 5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            confirmed[] · unconfirmed[] · recommendation
          </p>
          <p class="font-mono text-sm text-[var(--signal)] mt-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            ok · sources attached
          </p>
        </div>
      </div>
    </section>

    <section id="try" class="land-band land-band--void land-band--try" aria-labelledby="try-heading">
      <div class="home-shell">
        <div class="home-section__head">
          <p class="eyebrow text-[var(--signal)]">05 · try</p>
          <h2 id="try-heading" class="home-section__title text-[var(--night-fg)]">
            Three cases. One cold demo.
          </h2>
          <p class="mt-3 max-w-2xl text-[var(--signal-dim)]">
            Strong hits a live site. Weak has no proof. Thin breaks the link.
          </p>
        </div>

        <div class="land-cases land-cases--night">
          <RouterLink to="/founder" class="land-case land-case--night">
            <span class="font-mono text-[11px] text-[var(--signal)]">strong</span>
            <h3>Live URL</h3>
            <p>billspot.co against a real public site.</p>
          </RouterLink>
          <RouterLink to="/founder" class="land-case land-case--night">
            <span class="font-mono text-[11px] text-[#e8b84a]">weak</span>
            <h3>No proof</h3>
            <p>Claim only — expect a thin result.</p>
          </RouterLink>
          <RouterLink to="/founder" class="land-case land-case--night">
            <span class="font-mono text-[11px] text-[#f07178]">thin</span>
            <h3>Bad link</h3>
            <p>Broken URL — shows the failure path.</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="land-close" aria-labelledby="close-heading">
      <div class="home-shell land-close__inner">
        <div>
          <p class="font-mono text-[var(--signal)] text-xs tracking-[0.18em] uppercase">ready</p>
          <h2 id="close-heading" class="land-close__title">Run a real check in two minutes.</h2>
          <p class="mt-3 max-w-lg text-[var(--signal-dim)]">
            Load Strong on Founder, open the verdict, make the call.
            That’s the whole product story.
          </p>
        </div>
        <div class="land-close__actions">
          <RouterLink to="/founder" class="home-btn home-btn--primary">
            Open founder
          </RouterLink>
          <RouterLink to="/investor" class="home-btn home-btn--ghost">
            Investor queue
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
