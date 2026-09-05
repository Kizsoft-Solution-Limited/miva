<script setup lang="ts">
import { ref } from 'vue'
import type { Verdict } from '@/api/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  history: Verdict[]
  currentId?: string
}>()

const openId = ref<string | null>(null)

function tone(rec: Verdict['recommendation']) {
  if (rec === 'approve') return 'good'
  if (rec === 'reject') return 'bad'
  return 'warn'
}

function label(rec: Verdict['recommendation']) {
  return rec === 'needs_more_info' ? 'needs more info' : rec
}

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section v-if="history.length" class="surface p-5">
    <div class="flex items-baseline justify-between gap-3">
      <h2 class="text-sm font-bold text-[var(--ink)]">Verdict history</h2>
      <p class="font-mono text-xs text-[var(--muted)]">{{ history.length }} run{{ history.length === 1 ? '' : 's' }}</p>
    </div>

    <ul class="mt-4 space-y-2">
      <li
        v-for="item in history"
        :key="item.id"
        class="rounded-[12px] border border-[var(--line)] bg-[var(--paper)]/60"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2.5 text-left"
          @click="toggle(item.id)"
        >
          <span class="font-mono text-xs text-[var(--accent)]">v{{ item.version }}</span>
          <StatusBadge :label="label(item.recommendation)" :tone="tone(item.recommendation)" />
          <span
            v-if="item.id === currentId"
            class="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--signal)]"
          >
            current
          </span>
          <span class="ml-auto text-xs text-[var(--muted)]">
            {{ new Date(item.createdAt).toLocaleString() }}
          </span>
        </button>
        <div v-if="openId === item.id" class="border-t border-[var(--line)] px-3 py-3 text-sm">
          <p class="font-semibold text-[var(--ink)]">{{ item.summary }}</p>
          <p class="mt-2 whitespace-pre-wrap text-[var(--ink-soft)]">{{ item.reasoning }}</p>
          <p class="mt-2 font-mono text-[11px] text-[var(--muted)]">
            decision: {{ item.investorDecision.replaceAll('_', ' ') }}
            <template v-if="item.investorNote"> · {{ item.investorNote }}</template>
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>
