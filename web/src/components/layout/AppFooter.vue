<script setup lang="ts">
import { RouterLink } from 'vue-router'
import MivaLogo from '@/components/brand/MivaLogo.vue'
</script>

<template>
  <footer class="app-chrome-footer">
    <div class="app-chrome-footer__inner">
      <div>
        <RouterLink to="/" class="inline-flex no-underline" aria-label="MIVA home">
          <MivaLogo :size="40" wordmark />
        </RouterLink>
        <p class="mt-3 max-w-sm text-sm text-[var(--signal-dim)]">
          Milestone verification for funding. Agent recommends. You keep the pen.
        </p>
      </div>

      <div class="app-chrome-footer__cols">
        <div>
          <p class="eyebrow text-[var(--signal)]">Go</p>
          <ul class="mt-3 space-y-2 text-sm font-semibold text-[var(--night-fg)]">
            <li><RouterLink class="hover:text-[var(--signal)]" to="/founder">Submit proof</RouterLink></li>
            <li><RouterLink class="hover:text-[var(--signal)]" to="/investor">Investor queue</RouterLink></li>
            <li><RouterLink class="hover:text-[var(--signal)]" to="/">Home</RouterLink></li>
          </ul>
        </div>
        <div>
          <p class="eyebrow text-[var(--signal)]">Orbio</p>
          <p class="mt-3 max-w-xs text-sm text-[var(--signal-dim)]">
            Contest build on an Orbio key. Tool use shows on each verdict.
          </p>
        </div>
      </div>
    </div>

    <div class="app-chrome-footer__bar">
      <div class="app-chrome-footer__inner app-chrome-footer__bar-row">
        <p class="font-mono text-xs tracking-wide text-[var(--signal-dim)]">
          orbio build week · miva
        </p>
        <p class="text-xs text-[var(--signal-dim)]">No escrow in v1.</p>
      </div>
    </div>
  </footer>
</template>
