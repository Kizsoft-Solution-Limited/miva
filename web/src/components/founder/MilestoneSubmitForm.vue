<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { CreateMilestonePayload, ProofType } from '@/api/types'

const props = defineProps<{
  preset?: CreateMilestonePayload | null
  busy?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateMilestonePayload]
}>()

const PROOF_TYPES: { id: ProofType; label: string; hint: string }[] = [
  { id: 'url', label: 'URL', hint: 'Public page or post' },
  { id: 'pdf', label: 'PDF', hint: 'Link or upload' },
  { id: 'repo', label: 'Repo', hint: 'Public GitHub / git URL' },
  { id: 'metric', label: 'Metric', hint: 'Number + source' },
  { id: 'text', label: 'Text', hint: 'Paste excerpt only' },
]

const form = reactive({
  title: '',
  claim: '',
  founderName: '',
  proofType: 'url' as ProofType,
  proofUrl: '',
  proofText: '',
})

const file = ref<File | null>(null)
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
    file.value = null
    localError.message = ''
  },
  { immediate: true },
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

  if (form.proofType === 'pdf' && !proofUrl && !file.value && !form.proofText.trim()) {
    localError.message = 'Add a PDF link, upload a PDF, or paste an excerpt.'
    return
  }

  emit('submit', {
    title: form.title.trim(),
    claim: form.claim.trim(),
    founderName: form.founderName.trim(),
    proofType: form.proofType,
    proofUrl: proofUrl || undefined,
    proofText: form.proofText.trim() || undefined,
    file: file.value,
  })
}
</script>

<template>
  <form class="ws-form space-y-4" autocomplete="off" @submit.prevent="onSubmit">
    <div class="ws-form__head">
      <h2 class="text-xl font-medium text-[var(--ink)]">Submit proof</h2>
      <p class="mt-1 text-sm text-[var(--muted)]">Pick a proof type, then add a link, file, or paste.</p>
    </div>

    <p
      v-if="localError.message"
      class="rounded-[10px] border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
    >
      {{ localError.message }}
    </p>

    <div>
      <p class="mb-2 text-sm font-bold text-[var(--ink)]">Proof type</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in PROOF_TYPES"
          :key="item.id"
          type="button"
          class="rounded-full border px-3 py-1.5 text-left text-sm transition"
          :class="
            form.proofType === item.id
              ? 'border-[var(--signal)] bg-[var(--accent-soft)] text-[var(--signal)]'
              : 'border-[var(--line)] bg-black/25 text-[var(--ink-soft)] hover:border-[var(--signal)]'
          "
          @click="form.proofType = item.id"
        >
          <span class="font-bold">{{ item.label }}</span>
          <span class="ml-1.5 text-xs opacity-70">{{ item.hint }}</span>
        </button>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block text-sm">
        <span class="mb-1.5 block font-bold text-[var(--ink)]">Founder name</span>
        <input
          v-model="form.founderName"
          required
          name="founderName"
          autocomplete="name"
          class="field"
          placeholder="Your name"
        />
      </label>
      <label class="block text-sm">
        <span class="mb-1.5 block font-bold text-[var(--ink)]">Milestone title</span>
        <input
          v-model="form.title"
          required
          minlength="2"
          name="title"
          autocomplete="off"
          class="field"
          placeholder="Short title"
        />
      </label>
    </div>

    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Claim</span>
      <textarea
        v-model="form.claim"
        required
        minlength="5"
        rows="3"
        name="claim"
        autocomplete="off"
        class="field"
        placeholder="What should we verify?"
      />
    </label>

    <label v-if="form.proofType !== 'text'" class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">
        {{ form.proofType === 'pdf' ? 'PDF URL (optional if uploading)' : 'Proof URL' }}
      </span>
      <input
        v-model="form.proofUrl"
        type="text"
        inputmode="url"
        name="proofUrl"
        autocomplete="off"
        spellcheck="false"
        class="field"
        :placeholder="
          form.proofType === 'repo'
            ? 'Paste a public repo link'
            : form.proofType === 'pdf'
              ? 'Paste a public PDF link'
              : 'Paste a public link'
        "
      />
    </label>

    <label v-if="form.proofType === 'pdf'" class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Upload PDF</span>
      <input
        type="file"
        accept="application/pdf,.pdf"
        class="field file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-1 file:text-sm file:font-bold file:text-[var(--signal)]"
        @change="onFileChange"
      />
      <p v-if="file" class="mt-1.5 text-xs text-[var(--muted)]">
        Selected: {{ file.name }} ({{ Math.round(file.size / 1024) }} KB)
      </p>
      <p v-else class="mt-1.5 text-xs text-[var(--muted)]">Max 4MB. Or use a public PDF link above.</p>
    </label>

    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">
        {{ form.proofType === 'text' ? 'Proof text' : 'Extra notes / excerpt (optional)' }}
      </span>
      <textarea
        v-model="form.proofText"
        :required="form.proofType === 'text'"
        rows="3"
        name="proofText"
        autocomplete="off"
        class="field"
        :placeholder="
          form.proofType === 'metric'
            ? 'Paste the metric and where it came from'
            : form.proofType === 'text'
              ? 'Paste the excerpt to verify'
              : 'Optional notes if the link alone is thin'
        "
      />
    </label>

    <AppButton type="submit" :disabled="busy">
      {{ busy ? 'Checking…' : 'Run verification' }}
    </AppButton>

    <div v-if="busy" class="ws-verify" aria-live="polite">
      <p class="font-mono text-xs tracking-wide text-[var(--accent)]">orbio · verifying</p>
      <p class="mt-1 text-sm font-bold text-[var(--ink)]">Running the check…</p>
      <ul class="mt-2 space-y-1 text-xs text-[var(--muted)]">
        <li>Reading the claim and proof</li>
        <li>Web search / PDF if needed</li>
        <li>Building structured JSON verdict</li>
      </ul>
    </div>
  </form>
</template>
