<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DecisionPanel from '@/components/investor/DecisionPanel.vue'
import VerdictCard from '@/components/investor/VerdictCard.vue'
import VerdictHistory from '@/components/investor/VerdictHistory.vue'
import ProofRecheckForm from '@/components/founder/ProofRecheckForm.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBack from '@/components/ui/AppBack.vue'
import { useMilestoneStore } from '@/stores/milestones'
import type { UpdateProofPayload } from '@/api/types'

const route = useRoute()
const store = useMilestoneStore()
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/investor/${String(route.params.id)}`
})

const needsMoreInfo = computed(
  () => store.current?.verdict?.investorDecision === 'more_info_requested',
)

const canDecide = computed(() => {
  const d = store.current?.verdict?.investorDecision
  return Boolean(store.current?.verdict) && d === 'pending'
})

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
  try {
    await store.decide(id, decision, note)
  } catch {
    // store.error already set
  }
}

async function onRecheck(payload: UpdateProofPayload) {
  const id = String(route.params.id)
  try {
    await store.recheck(id, payload)
  } catch {
    // store.error already set
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    window.prompt('Copy this link', shareUrl.value)
  }
}
</script>

<template>
  <div class="ws-page mx-auto max-w-3xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <AppBack to="/investor" label="Queue" />
      <AppButton variant="secondary" :disabled="!shareUrl" @click="copyLink">
        {{ copied ? 'Copied' : 'Copy verdict link' }}
      </AppButton>
    </div>

    <header class="ws-hero !mb-0 !border-0 !pb-0">
      <div>
        <p class="eyebrow">Investor review</p>
        <h1>{{ store.current?.title || 'Milestone' }}</h1>
        <p v-if="store.current">{{ store.current.claim }}</p>
      </div>
    </header>

    <ErrorBanner v-if="store.error" :message="store.error" />

    <div
      v-if="store.loading && !store.current"
      class="space-y-3"
      aria-busy="true"
      aria-live="polite"
    >
      <p class="font-mono text-xs tracking-wide text-[var(--muted)]">Loading milestone…</p>
      <div class="surface animate-pulse p-6">
        <div class="h-4 w-1/3 rounded bg-[var(--paper-2)]" />
        <div class="mt-4 h-3 w-full rounded bg-[var(--paper-2)]" />
      </div>
    </div>

    <template v-if="store.current">
      <section class="surface p-6">
        <h2 class="text-sm font-bold text-[var(--ink)]">Submitted proof</h2>
        <dl class="mt-3 grid gap-3 text-sm text-[var(--ink)] sm:grid-cols-2">
          <div>
            <dt class="text-[var(--muted)]">Founder</dt>
            <dd class="font-bold">{{ store.current.founderName }}</dd>
          </div>
          <div>
            <dt class="text-[var(--muted)]">Proof type</dt>
            <dd class="font-bold">{{ store.current.proofType }}</dd>
          </div>
          <div v-if="store.current.proofUrl" class="sm:col-span-2">
            <dt class="text-[var(--muted)]">URL</dt>
            <dd>
              <a
                :href="store.current.proofUrl"
                class="break-all text-[var(--accent)] underline"
                target="_blank"
                rel="noreferrer"
              >
                {{ store.current.proofUrl }}
              </a>
            </dd>
          </div>
          <div v-if="store.current.hasProofFile" class="sm:col-span-2">
            <dt class="text-[var(--muted)]">Uploaded file</dt>
            <dd class="font-bold">{{ store.current.proofFileName || 'PDF on file' }}</dd>
          </div>
          <div v-if="store.current.proofText" class="sm:col-span-2">
            <dt class="text-[var(--muted)]">Text</dt>
            <dd class="whitespace-pre-wrap">{{ store.current.proofText }}</dd>
          </div>
        </dl>
      </section>

      <VerdictCard
        v-if="store.current.verdict"
        :verdict="store.current.verdict"
        :check="store.current.check"
      />
      <div
        v-else
        class="ws-empty border-solid border-[var(--warn)]/30 bg-[var(--warn-soft)]"
        aria-live="polite"
      >
        <p class="font-mono text-xs tracking-wide text-[var(--warn)]">orbio · in progress</p>
        <p class="mt-2 font-bold text-[var(--ink)]">No verdict yet</p>
      </div>

      <VerdictHistory
        :history="store.current.verdictHistory || []"
        :current-id="store.current.verdict?.id"
      />

      <ProofRecheckForm
        v-if="needsMoreInfo"
        :milestone="store.current"
        :busy="store.loading"
        @recheck="onRecheck"
      />

      <DecisionPanel
        v-if="canDecide"
        :disabled="store.loading || !store.current.verdict"
        @decide="onDecide"
      />
      <p
        v-else-if="store.current.verdict && !needsMoreInfo"
        class="text-sm text-[var(--muted)]"
      >
        Decision recorded:
        {{ store.current.verdict.investorDecision.replaceAll('_', ' ') }}.
      </p>
    </template>
  </div>
</template>
