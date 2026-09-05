<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import { useMilestoneStore } from '@/stores/milestones'
import type { Recommendation } from '@/api/types'

const store = useMilestoneStore()

onMounted(() => {
  void store.fetchAll()
})

function tone(rec: Recommendation) {
  if (rec === 'approve') return 'good'
  if (rec === 'reject') return 'bad'
  return 'warn'
}

function decisionLabel(item: (typeof store.items)[number]) {
  if (!item.verdict) return 'Checking…'
  const d = item.verdict.investorDecision
  if (d === 'pending') {
    return item.verdict.recommendation === 'needs_more_info'
      ? 'needs more info'
      : item.verdict.recommendation
  }
  if (d === 'more_info_requested') return 'more info asked'
  return d
}
</script>

<template>
  <div class="ws-page mx-auto max-w-3xl">
    <header class="ws-hero">
      <div>
        <p class="eyebrow">Investor</p>
        <h1>Queue</h1>
        <p>Open a milestone. Read the verdict. Decide.</p>
      </div>
      <div class="ws-chip-row">
        <span class="ws-chip">{{ store.items.length }} in queue</span>
        <RouterLink to="/founder" class="ws-chip ws-chip--hot no-underline">
          + submit proof
        </RouterLink>
      </div>
    </header>

    <ErrorBanner v-if="store.error" :message="store.error" />

    <div
      v-if="store.loading && !store.items.length"
      class="space-y-3"
      aria-busy="true"
      aria-live="polite"
    >
      <p class="font-mono text-xs tracking-wide text-[var(--muted)]">Loading queue…</p>
      <div v-for="n in 3" :key="n" class="surface animate-pulse p-4">
        <div class="h-4 w-2/5 rounded bg-[var(--paper-2)]" />
        <div class="mt-3 h-3 w-full rounded bg-[var(--paper-2)]" />
        <div class="mt-2 h-3 w-3/5 rounded bg-[var(--paper-2)]" />
      </div>
    </div>

    <div v-else-if="!store.items.length" class="ws-empty">
      <p class="font-mono text-xs tracking-wide text-[var(--accent)]">queue · empty</p>
      <h2 class="mt-2 text-2xl font-medium text-[var(--ink)]">No milestones yet</h2>
      <p class="mt-2 max-w-md text-[var(--muted)]">
        Submit proof from Founder. When the agent finishes, the verdict lands here.
      </p>
      <RouterLink
        to="/founder"
        class="mt-5 inline-flex rounded-full bg-[var(--signal)] px-4 py-2.5 text-sm font-bold text-[#052816] shadow-[0_0_24px_var(--glow)] hover:bg-[var(--accent-hover)]"
      >
        Submit proof
      </RouterLink>
    </div>

    <ul v-else class="space-y-3">
      <li v-for="item in store.items" :key="item.id">
        <RouterLink :to="`/investor/${item.id}`" class="ws-queue-item">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-bold text-[var(--ink)]">{{ item.title }}</h2>
            <StatusBadge
              v-if="item.verdict"
              :label="decisionLabel(item)"
              :tone="tone(item.verdict.recommendation)"
            />
            <StatusBadge v-else label="verifying" tone="warn" />
          </div>
          <p class="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{{ item.claim }}</p>
          <p class="mt-2 font-mono text-[11px] text-[var(--muted)]">
            {{ item.founderName }} · {{ new Date(item.createdAt).toLocaleString() }}
          </p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
