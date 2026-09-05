<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MilestoneSubmitForm from '@/components/founder/MilestoneSubmitForm.vue'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import { demoCases } from '@/demo/cases'
import { useMilestoneStore } from '@/stores/milestones'
import type { CreateMilestonePayload } from '@/api/types'

const store = useMilestoneStore()
const router = useRouter()
const preset = ref<CreateMilestonePayload | null>(null)

async function onSubmit(payload: CreateMilestonePayload) {
  try {
    const created = await store.submit(payload)
    await router.push(`/investor/${created.id}`)
  } catch {
    // store.error already set
  }
}

function loadCase(id: string) {
  const match = demoCases.find((c) => c.id === id)
  if (!match) return
  preset.value = { ...match.payload }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <header>
      <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Founder</p>
      <h1 class="text-2xl font-semibold text-slate-900">Milestone proof</h1>
      <p class="mt-1 text-sm text-slate-600">
        Drop evidence. Get a verdict the investor can read.
      </p>
    </header>

    <section class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p class="text-sm font-medium text-slate-800">Demo cases</p>
      <p class="mt-1 text-xs text-slate-500">Fills the form. You still hit Run verification.</p>
      <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          v-for="item in demoCases"
          :key="item.id"
          type="button"
          class="rounded-lg bg-slate-100 px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-200"
          @click="loadCase(item.id)"
        >
          <span class="font-medium">{{ item.label }}</span>
          <span class="mt-0.5 block text-xs text-slate-500">{{ item.blurb }}</span>
        </button>
      </div>
    </section>

    <ErrorBanner v-if="store.error" :message="store.error" />
    <MilestoneSubmitForm :preset="preset" :busy="store.loading" @submit="onSubmit" />
  </div>
</template>
