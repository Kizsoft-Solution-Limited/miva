<script setup lang="ts">
import { ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import MilestoneSubmitForm from '@/components/founder/MilestoneSubmitForm.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import { demoCases } from '@/demo/cases'
import { useMilestoneStore } from '@/stores/milestones'
import type { CreateMilestonePayload } from '@/api/types'

const store = useMilestoneStore()
const router = useRouter()
const preset = ref<CreateMilestonePayload | null>(null)
const formKey = ref(0)

async function onSubmit(payload: CreateMilestonePayload) {
  try {
    const created = await store.submit(payload)
    preset.value = null
    formKey.value += 1
    await router.push(`/investor/${created.id}`)
  } catch {
    // store error already set
  }
}

function loadCase(id: string) {
  const match = demoCases.find((c) => c.id === id)
  if (!match) return
  preset.value = { ...match.payload }
  formKey.value += 1
}

onBeforeRouteLeave(() => {
  store.error = null
})
</script>

<template>
  <div class="ws-page mx-auto max-w-3xl">
    <header class="ws-hero">
      <div>
        <p class="eyebrow">Founder</p>
        <h1>Submit proof</h1>
        <p>Drop evidence. Get a verdict the investor can read.</p>
      </div>
      <div class="ws-chip-row">
        <span class="ws-chip ws-chip--hot">orbio live</span>
        <span class="ws-chip">web · repo · pdf · json</span>
      </div>
    </header>

    <section class="mb-6">
      <div class="mb-3 flex items-baseline justify-between gap-3">
        <p class="text-sm font-bold text-[var(--ink)]">Demo cases</p>
        <p class="text-xs text-[var(--muted)]">Tap Hard first. Fills the form — you still hit Run.</p>
      </div>
      <div class="ws-cases">
        <button
          v-for="item in demoCases"
          :key="item.id"
          type="button"
          class="ws-case"
          @click="loadCase(item.id)"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.blurb }}</span>
        </button>
      </div>
    </section>

    <ErrorBanner v-if="store.error" :message="store.error" />
    <MilestoneSubmitForm
      :key="formKey"
      :preset="preset"
      :busy="store.loading"
      @submit="onSubmit"
    />
  </div>
</template>
