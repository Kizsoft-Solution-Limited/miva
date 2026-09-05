<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { Milestone, ProofType, UpdateProofPayload } from '@/api/types'

const props = defineProps<{
  milestone: Milestone
  busy?: boolean
}>()

const emit = defineEmits<{
  recheck: [payload: UpdateProofPayload]
}>()

const form = reactive({
  claim: props.milestone.claim,
  proofType: props.milestone.proofType as ProofType,
  proofUrl: props.milestone.proofUrl || '',
  proofText: props.milestone.proofText || '',
})
const file = ref<File | null>(null)
const localError = reactive({ message: '' })

watch(
  () => props.milestone,
  (m) => {
    form.claim = m.claim
    form.proofType = m.proofType as ProofType
    form.proofUrl = m.proofUrl || ''
    form.proofText = m.proofText || ''
    file.value = null
  },
)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const next = input.files?.[0] || null
  if (next && next.size > 4 * 1024 * 1024) {
    localError.message = 'PDF must be 4MB or smaller.'
    input.value = ''
    file.value = null
    return
  }
  file.value = next
  localError.message = ''
  if (next) form.proofType = 'pdf'
}

function onSubmit() {
  localError.message = ''
  const proofUrl = form.proofUrl.trim()
  if (proofUrl) {
    try {
      const url = new URL(proofUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        localError.message = 'Proof URL must start with http:// or https://'
        return
      }
    } catch {
      localError.message = 'Proof URL is not a valid link.'
      return
    }
  }

  emit('recheck', {
    claim: form.claim.trim(),
    proofType: form.proofType,
    proofUrl: proofUrl || undefined,
    proofText: form.proofText.trim() || undefined,
    file: file.value,
  })
}
</script>

<template>
  <form class="ws-form space-y-4 border-[var(--warn)]/40" @submit.prevent="onSubmit">
    <div class="ws-form__head">
      <p class="font-mono text-xs tracking-wide text-[var(--warn)]">more info · update proof</p>
      <h2 class="mt-1 text-xl font-medium text-[var(--ink)]">Update proof & re-run</h2>
      <p class="mt-1 text-sm text-[var(--muted)]">
        Investor asked for more. Change the proof, then run a new verdict version.
      </p>
      <p
        v-if="milestone.verdict?.investorNote"
        class="mt-2 rounded-[10px] bg-[var(--warn-soft)] px-3 py-2 text-sm text-[var(--ink)]"
      >
        Note: {{ milestone.verdict.investorNote }}
      </p>
    </div>

    <p
      v-if="localError.message"
      class="rounded-[10px] border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
    >
      {{ localError.message }}
    </p>

    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Claim</span>
      <textarea v-model="form.claim" required minlength="5" rows="3" class="field" />
    </label>

    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Proof type</span>
      <select v-model="form.proofType" class="field">
        <option value="url">URL</option>
        <option value="pdf">PDF</option>
        <option value="repo">Repo</option>
        <option value="metric">Metric</option>
        <option value="text">Text</option>
      </select>
    </label>

    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Proof URL</span>
      <input v-model="form.proofUrl" type="url" class="field" placeholder="https://…" />
    </label>

    <label v-if="form.proofType === 'pdf'" class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Upload PDF</span>
      <input type="file" accept="application/pdf,.pdf" class="field" @change="onFileChange" />
      <p v-if="milestone.hasProofFile && !file" class="mt-1 text-xs text-[var(--muted)]">
        Current file on record: {{ milestone.proofFileName || 'upload.pdf' }}
      </p>
    </label>

    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Proof text / excerpt</span>
      <textarea v-model="form.proofText" rows="3" class="field" />
    </label>

    <AppButton type="submit" :disabled="busy">
      {{ busy ? 'Re-checking…' : 'Update & re-run check' }}
    </AppButton>
  </form>
</template>
