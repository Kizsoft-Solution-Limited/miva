<script setup lang="ts">
import type { Finding, Verdict } from '@/api/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{ verdict: Verdict }>()

function toneFor(recommendation: Verdict['recommendation']) {
  if (recommendation === 'approve') return 'good'
  if (recommendation === 'reject') return 'bad'
  return 'warn'
}

function labelFor(recommendation: Verdict['recommendation']) {
  return recommendation.replaceAll('_', ' ')
}
</script>

<template>
  <section class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div class="flex flex-wrap items-center gap-3">
      <h2 class="text-lg font-semibold text-slate-900">Agent verdict</h2>
      <StatusBadge :label="labelFor(verdict.recommendation)" :tone="toneFor(verdict.recommendation)" />
      <StatusBadge :label="`investor: ${verdict.investorDecision.replaceAll('_', ' ')}`" />
    </div>

    <p class="text-sm text-slate-700">{{ verdict.summary }}</p>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="mb-2 text-sm font-semibold text-emerald-800">Confirmed</h3>
        <ul v-if="verdict.confirmed.length" class="space-y-2">
          <li
            v-for="(item, i) in verdict.confirmed as Finding[]"
            :key="`c-${i}`"
            class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950"
          >
            <p class="font-medium">{{ item.claim }}</p>
            <p class="mt-1 opacity-90">{{ item.evidence }}</p>
            <a
              v-if="item.sourceUrl"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
              class="mt-1 inline-block text-emerald-700 underline"
            >
              source
            </a>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">Nothing confirmed yet.</p>
      </div>

      <div>
        <h3 class="mb-2 text-sm font-semibold text-amber-900">Unconfirmed</h3>
        <ul v-if="verdict.unconfirmed.length" class="space-y-2">
          <li
            v-for="(item, i) in verdict.unconfirmed as Finding[]"
            :key="`u-${i}`"
            class="rounded-lg bg-amber-50 p-3 text-sm text-amber-950"
          >
            <p class="font-medium">{{ item.claim }}</p>
            <p class="mt-1 opacity-90">{{ item.evidence }}</p>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">No open gaps.</p>
      </div>
    </div>

    <div>
      <h3 class="mb-1 text-sm font-semibold text-slate-800">Reasoning</h3>
      <p class="whitespace-pre-wrap text-sm text-slate-700">{{ verdict.reasoning }}</p>
    </div>
  </section>
</template>
