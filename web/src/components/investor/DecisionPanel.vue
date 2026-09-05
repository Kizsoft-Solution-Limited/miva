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
  <section class="surface space-y-3 p-4 sm:p-6">
    <div class="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-4">
      <div>
        <h2 class="text-xl font-medium text-[var(--ink)]">Your call</h2>
        <p class="mt-1 text-sm text-[var(--muted)]">Agent recommends. You decide.</p>
      </div>
      <span class="ws-chip ws-chip--hot">human final</span>
    </div>
    <label class="block text-sm">
      <span class="mb-1.5 block font-bold text-[var(--ink)]">Note (optional)</span>
      <textarea v-model="note" rows="2" class="field" />
    </label>
    <div class="grid grid-cols-1 gap-2 pt-1 sm:flex sm:flex-row sm:flex-wrap">
      <AppButton
        wide
        :disabled="disabled"
        @click="emit('decide', 'approved', note.trim() || undefined)"
      >
        Approve release
      </AppButton>
      <AppButton
        wide
        variant="secondary"
        :disabled="disabled"
        @click="emit('decide', 'more_info_requested', note.trim() || undefined)"
      >
        Need more info
      </AppButton>
      <AppButton
        wide
        variant="danger"
        :disabled="disabled"
        @click="emit('decide', 'rejected', note.trim() || undefined)"
      >
        Reject
      </AppButton>
    </div>
  </section>
</template>
