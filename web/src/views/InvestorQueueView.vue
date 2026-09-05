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
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <header class="flex items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Investor</p>
        <h1 class="text-2xl font-semibold text-slate-900">Queue</h1>
        <p class="mt-1 text-sm text-slate-600">Open a milestone. Read the verdict. Decide.</p>
      </div>
      <RouterLink to="/founder" class="text-sm font-medium text-slate-700 underline">Submit proof</RouterLink>
    </header>

    <ErrorBanner v-if="store.error" :message="store.error" />
    <p v-if="store.loading && !store.items.length" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="!store.items.length" class="text-sm text-slate-500">
      No milestones yet. Submit one from Founder.
    </p>

    <ul class="space-y-3">
      <li v-for="item in store.items" :key="item.id">
        <RouterLink
          :to="`/investor/${item.id}`"
          class="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
        >
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-semibold text-slate-900">{{ item.title }}</h2>
            <StatusBadge
              v-if="item.verdict"
              :label="item.verdict.recommendation === 'needs_more_info' ? 'needs more info' : item.verdict.recommendation"
              :tone="tone(item.verdict.recommendation)"
            />
          </div>
          <p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ item.claim }}</p>
          <p class="mt-2 text-xs text-slate-500">
            {{ item.founderName }} · {{ new Date(item.createdAt).toLocaleString() }}
          </p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
