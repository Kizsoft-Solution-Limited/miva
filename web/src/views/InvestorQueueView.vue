<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useMilestoneStore } from '@/stores/milestones'

const store = useMilestoneStore()

onMounted(() => {
  void store.fetchAll()
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <header class="flex items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-slate-500">Investor</p>
        <h1 class="text-2xl font-semibold text-slate-900">Verification queue</h1>
      </div>
      <RouterLink to="/founder" class="text-sm font-medium text-slate-700 underline">Submit as founder</RouterLink>
    </header>

    <p v-if="store.error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{{ store.error }}</p>
    <p v-if="store.loading && !store.items.length" class="text-sm text-slate-500">Loading…</p>
    <p v-else-if="!store.items.length" class="text-sm text-slate-500">No milestones yet.</p>

    <ul class="space-y-3">
      <li v-for="item in store.items" :key="item.id">
        <RouterLink
          :to="`/investor/${item.id}`"
          class="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
        >
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-semibold text-slate-900">{{ item.title }}</h2>
            <StatusBadge
              v-if="item.verdict"
              :label="item.verdict.recommendation.replaceAll('_', ' ')"
              :tone="item.verdict.recommendation === 'approve' ? 'good' : item.verdict.recommendation === 'reject' ? 'bad' : 'warn'"
            />
          </div>
          <p class="mt-1 text-sm text-slate-600">{{ item.claim }}</p>
          <p class="mt-2 text-xs text-slate-500">{{ item.founderName }} · {{ new Date(item.createdAt).toLocaleString() }}</p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
