<script setup lang="ts">
import { computed } from 'vue'
import type { Finding, Milestone, Verdict } from '@/api/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps<{
  verdict: Verdict
  check?: Milestone['check']
}>()

function isContext(item: Finding) {
  return item.claim.toLowerCase().startsWith('context ·')
}

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
  if (recommendation === 'approve') return 'bg-[var(--ok-soft)] ring-[var(--signal)]/30'
  if (recommendation === 'reject') return 'bg-[var(--danger-soft)] ring-[var(--danger)]/35'
  return 'bg-[var(--warn-soft)] ring-[var(--warn)]/35'
}

const coreConfirmed = computed(() =>
  (props.verdict.confirmed as Finding[]).filter((f) => !isContext(f)),
)
const coreUnconfirmed = computed(() =>
  (props.verdict.unconfirmed as Finding[]).filter((f) => !isContext(f)),
)
const contextFindings = computed(() => [
  ...(props.verdict.confirmed as Finding[]).filter(isContext).map((f) => ({
    ...f,
    tone: 'ok' as const,
  })),
  ...(props.verdict.unconfirmed as Finding[]).filter(isContext).map((f) => ({
    ...f,
    tone: 'warn' as const,
  })),
])

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
  <section class="surface space-y-5 p-6">
    <div class="rounded-[12px] px-4 py-3 ring-1" :class="panelClass(verdict.recommendation)">
      <div class="flex flex-wrap items-center gap-2">
        <p class="eyebrow !tracking-[0.16em]">Agent says</p>
        <StatusBadge
          v-if="verdict.version"
          :label="`v${verdict.version}`"
          tone="neutral"
        />
        <StatusBadge :label="labelFor(verdict.recommendation)" :tone="toneFor(verdict.recommendation)" />
        <StatusBadge :label="`you: ${verdict.investorDecision.replaceAll('_', ' ')}`" />
      </div>
      <p class="mt-2 text-sm font-semibold text-[var(--ink)]">{{ verdict.summary }}</p>
    </div>

    <p v-if="checkBits().length" class="text-xs text-[var(--muted)]">
      This check used: {{ checkBits().join(' · ') }}
    </p>

    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="mb-2 text-sm font-bold text-[var(--ok)]">Confirmed</h3>
        <ul v-if="coreConfirmed.length" class="space-y-2">
          <li
            v-for="(item, i) in coreConfirmed"
            :key="`c-${i}`"
            class="rounded-[10px] bg-[var(--ok-soft)] p-3 text-sm text-[var(--ink)]"
          >
            <p class="font-semibold">{{ item.claim }}</p>
            <p class="mt-1 text-[var(--ink-soft)]">{{ item.evidence }}</p>
            <a
              v-if="item.sourceUrl"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
              class="mt-1 inline-block break-all text-[var(--accent)] underline"
            >
              {{ item.sourceUrl }}
            </a>
          </li>
        </ul>
        <p v-else class="text-sm text-[var(--muted)]">Nothing confirmed.</p>
      </div>

      <div>
        <h3 class="mb-2 text-sm font-bold text-[var(--warn)]">Unconfirmed</h3>
        <ul v-if="coreUnconfirmed.length" class="space-y-2">
          <li
            v-for="(item, i) in coreUnconfirmed"
            :key="`u-${i}`"
            class="rounded-[10px] bg-[var(--warn-soft)] p-3 text-sm text-[var(--ink)]"
          >
            <p class="font-semibold">{{ item.claim }}</p>
            <p class="mt-1 text-[var(--ink-soft)]">{{ item.evidence }}</p>
            <a
              v-if="item.sourceUrl"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
              class="mt-1 inline-block break-all text-[var(--warn)] underline"
            >
              {{ item.sourceUrl }}
            </a>
          </li>
        </ul>
        <p v-else class="text-sm text-[var(--muted)]">No open gaps.</p>
      </div>
    </div>

    <div v-if="contextFindings.length">
      <h3 class="mb-1 text-sm font-bold text-[var(--ink)]">Context</h3>
      <p class="mb-2 text-xs text-[var(--muted)]">
        Company / founder / metric extras from public search. Helpful — not enough alone to approve.
      </p>
      <ul class="space-y-2">
        <li
          v-for="(item, i) in contextFindings"
          :key="`x-${i}`"
          class="rounded-[10px] border border-[var(--line)] bg-black/20 p-3 text-sm text-[var(--ink)]"
        >
          <p class="font-mono text-[10px] uppercase tracking-wider text-[var(--signal)]">
            {{ item.tone === 'ok' ? 'confirmed context' : 'unconfirmed context' }}
          </p>
          <p class="mt-1 font-semibold">{{ item.claim.replace(/^Context ·\s*/i, '') }}</p>
          <p class="mt-1 text-[var(--ink-soft)]">{{ item.evidence }}</p>
          <a
            v-if="item.sourceUrl"
            :href="item.sourceUrl"
            target="_blank"
            rel="noreferrer"
            class="mt-1 inline-block break-all text-[var(--accent)] underline"
          >
            {{ item.sourceUrl }}
          </a>
        </li>
      </ul>
    </div>

    <div>
      <h3 class="mb-1 text-sm font-bold text-[var(--ink)]">Reasoning</h3>
      <p class="whitespace-pre-wrap text-sm text-[var(--ink-soft)]">{{ verdict.reasoning }}</p>
    </div>

    <details class="rounded-[10px] border border-[var(--line)] bg-[var(--accent-mist)] px-3 py-2 text-sm text-[var(--ink-soft)]">
      <summary class="cursor-pointer font-semibold text-[var(--ink)]">Structured verdict (JSON)</summary>
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
