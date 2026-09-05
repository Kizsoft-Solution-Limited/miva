<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const emit = defineEmits<{
  decide: [decision: 'approved' | 'rejected' | 'more_info_requested', note?: string]
}>()

defineProps<{ disabled?: boolean }>()

const note = ref('')
</script>

<template>
  <section class="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h2 class="text-lg font-semibold text-slate-900">Investor decision</h2>
    <p class="text-sm text-slate-600">The agent recommends. You decide.</p>
    <label class="block text-sm">
      <span class="mb-1 block font-medium text-slate-700">Note (optional)</span>
      <textarea v-model="note" rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
    </label>
    <div class="flex flex-wrap gap-2">
      <AppButton :disabled="disabled" @click="emit('decide', 'approved', note)">Approve release</AppButton>
      <AppButton variant="secondary" :disabled="disabled" @click="emit('decide', 'more_info_requested', note)">
        Need more info
      </AppButton>
      <AppButton variant="danger" :disabled="disabled" @click="emit('decide', 'rejected', note)">Reject</AppButton>
    </div>
  </section>
</template>
