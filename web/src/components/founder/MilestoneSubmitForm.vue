<script setup lang="ts">
import { reactive, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { CreateMilestonePayload } from '@/api/types'

const props = defineProps<{
  preset?: CreateMilestonePayload | null
  busy?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateMilestonePayload]
}>()

const form = reactive({
  title: '',
  claim: '',
  founderName: '',
  proofType: 'url',
  proofUrl: '',
  proofText: '',
})

const localError = reactive({ message: '' })

watch(
  () => props.preset,
  (preset) => {
    if (!preset) return
    form.title = preset.title
    form.claim = preset.claim
    form.founderName = preset.founderName
    form.proofType = preset.proofType
    form.proofUrl = preset.proofUrl || ''
    form.proofText = preset.proofText || ''
    localError.message = ''
  },
)

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

  emit('submit', {
    title: form.title.trim(),
    claim: form.claim.trim(),
    founderName: form.founderName.trim(),
    proofType: form.proofType,
    proofUrl: proofUrl || undefined,
    proofText: form.proofText.trim() || undefined,
  })
}
</script>

<template>
  <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" @submit.prevent="onSubmit">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">Submit proof</h2>
      <p class="mt-1 text-sm text-slate-600">Agent checks it. Investor decides.</p>
    </div>

    <p v-if="localError.message" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
      {{ localError.message }}
    </p>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Founder name</span>
      <input v-model="form.founderName" required class="w-full rounded-lg border border-slate-300 px-3 py-2" />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Milestone title</span>
      <input
        v-model="form.title"
        required
        minlength="2"
        class="w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="e.g. Public site live"
      />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Claim</span>
      <textarea
        v-model="form.claim"
        required
        minlength="5"
        rows="3"
        class="w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="What should we verify?"
      />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Proof type</span>
      <select v-model="form.proofType" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        <option value="url">URL</option>
        <option value="pdf">PDF / doc link</option>
        <option value="repo">Repo</option>
        <option value="metric">Metric</option>
        <option value="text">Text</option>
      </select>
    </label>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Proof URL</span>
      <input
        v-model="form.proofUrl"
        type="url"
        class="w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="https://… (site, repo, or public PDF)"
      />
    </label>

    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Proof text / excerpt</span>
      <textarea
        v-model="form.proofText"
        rows="3"
        class="w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="Optional paste if you have no link"
      />
    </label>

    <AppButton type="submit" :disabled="busy">
      {{ busy ? 'Checking…' : 'Run verification' }}
    </AppButton>
  </form>
</template>
