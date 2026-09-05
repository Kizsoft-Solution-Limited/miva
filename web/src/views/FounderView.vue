<script setup lang="ts">
import { useRouter } from 'vue-router'
import MilestoneSubmitForm from '@/components/founder/MilestoneSubmitForm.vue'
import { useMilestoneStore } from '@/stores/milestones'
import type { CreateMilestonePayload } from '@/api/types'

const store = useMilestoneStore()
const router = useRouter()

async function onSubmit(payload: CreateMilestonePayload) {
  const created = await store.submit(payload)
  await router.push(`/investor/${created.id}`)
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <header>
      <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Founder</p>
      <h1 class="text-2xl font-semibold text-slate-900">Milestone proof</h1>
      <p class="mt-1 text-sm text-slate-600">
        Submit evidence. MIVA returns an auditable verdict for the investor.
      </p>
    </header>

    <p v-if="store.error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
      {{ store.error }}
    </p>

    <MilestoneSubmitForm @submit="onSubmit" />
    <p v-if="store.loading" class="text-sm text-slate-500">Running verification…</p>
  </div>
</template>
