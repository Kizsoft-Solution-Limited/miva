<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import DecisionPanel from '@/components/investor/DecisionPanel.vue'
import VerdictCard from '@/components/investor/VerdictCard.vue'
import { useMilestoneStore } from '@/stores/milestones'

const route = useRoute()
const store = useMilestoneStore()

async function load() {
  const id = String(route.params.id)
  await store.fetchOne(id)
}

onMounted(() => {
  void load()
})

watch(() => route.params.id, () => {
  void load()
})

async function onDecide(decision: 'approved' | 'rejected' | 'more_info_requested', note?: string) {
  const id = String(route.params.id)
  await store.decide(id, decision, note)
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <header>
      <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Investor review</p>
      <h1 class="text-2xl font-semibold text-slate-900">
        {{ store.current?.title || 'Milestone' }}
      </h1>
      <p v-if="store.current" class="mt-1 text-sm text-slate-600">{{ store.current.claim }}</p>
    </header>

    <p v-if="store.error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{{ store.error }}</p>
    <p v-if="store.loading && !store.current" class="text-sm text-slate-500">Loading…</p>

    <template v-if="store.current">
      <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-sm font-semibold text-slate-800">Submitted proof</h2>
        <dl class="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <div><dt class="text-slate-500">Founder</dt><dd>{{ store.current.founderName }}</dd></div>
          <div><dt class="text-slate-500">Proof type</dt><dd>{{ store.current.proofType }}</dd></div>
          <div class="sm:col-span-2" v-if="store.current.proofUrl">
            <dt class="text-slate-500">URL</dt>
            <dd>
              <a :href="store.current.proofUrl" class="underline" target="_blank" rel="noreferrer">
                {{ store.current.proofUrl }}
              </a>
            </dd>
          </div>
          <div class="sm:col-span-2" v-if="store.current.proofText">
            <dt class="text-slate-500">Text</dt>
            <dd class="whitespace-pre-wrap">{{ store.current.proofText }}</dd>
          </div>
        </dl>
      </section>

      <VerdictCard v-if="store.current.verdict" :verdict="store.current.verdict" />
      <DecisionPanel :disabled="store.loading" @decide="onDecide" />
    </template>
  </div>
</template>
