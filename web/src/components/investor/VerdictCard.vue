<script setup lang="ts">
import type { Finding, Milestone, Verdict } from '@/api/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps<{
  verdict: Verdict
  check?: Milestone['check']
}>()

function toneFor(recommendation: Verdict['recommendation']) {
  if (recommendation === 'approve') return 'good'
  if (recommendation === 'reject') return 'bad'
  return 'warn'
}

function labelFor(recommendation: Verdict['recommendation']) {
  if (recommendation === 'needs_more_info') return 'needs more info'
  return recommendation
}

function panelClass(recommendation: Verdict['recommendation']) {
  if (recommendation === 'approve') return 'bg-emerald-50 ring-emerald-200'
  if (recommendation === 'reject') return 'bg-rose-50 ring-rose-200'
  return 'bg-amber-50 ring-amber-200'
}

const checkBits = () => {
  const c = props.check
  if (!c) return [] as string[]
  const bits: string[] = []
  if (c.orbio) bits.push('Orbio key')
  if (c.webSearch) bits.push('web search')
  if (c.pdf) bits.push('PDF read')
  if (c.structuredJson) bits.push('structured JSON')
  return bits
}
</script>

<template>
  <section class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div
      class="rounded-xl px-4 py-3 ring-1"
      :class="panelClass(verdict.recommendation)"
    >
      <div class="flex flex-wrap items-center gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">Agent says</p>
        <StatusBadge :label="labelFor(verdict.recommendation)" :tone="toneFor(verdict.recommendation)" />
        <StatusBadge :label="`you: ${verdict.investorDecision.replaceAll('_', ' ')}`" />
      </div>
      <p class="mt-2 text-sm font-medium text-slate-900">{{ verdict.summary }}</p>
    </div>

    <p v-if="checkBits().length" class="text-xs text-slate-500">
      This check used: {{ checkBits().join(' · ') }}
    </p>

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
              class="mt-1 inline-block break-all text-emerald-700 underline"
            >
              {{ item.sourceUrl }}
            </a>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">Nothing confirmed.</p>
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
            <a
              v-if="item.sourceUrl"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
              class="mt-1 inline-block break-all text-amber-800 underline"
            >
              {{ item.sourceUrl }}
            </a>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">No open gaps.</p>
      </div>
    </div>

    <div>
      <h3 class="mb-1 text-sm font-semibold text-slate-800">Reasoning</h3>
      <p class="whitespace-pre-wrap text-sm text-slate-700">{{ verdict.reasoning }}</p>
    </div>

    <details class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
      <summary class="cursor-pointer font-medium">Structured verdict (JSON)</summary>
      <pre class="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{{
        JSON.stringify(
          {
            recommendation: verdict.recommendation,
            summary: verdict.summary,
            confirmed: verdict.confirmed,
            unconfirmed: verdict.unconfirmed,
            reasoning: verdict.reasoning,
          },
          null,
          2,
        )
      }}</pre>
    </details>
  </section>
</template>
