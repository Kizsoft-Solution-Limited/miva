<script setup lang="ts">
defineProps<{
  label: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide"
    :class="{
      'bg-[var(--paper-2)] text-[var(--ink-soft)]': !tone || tone === 'neutral',
      'bg-[var(--ok-soft)] text-[var(--ok)]': tone === 'good',
      'bg-[var(--warn-soft)] text-[var(--warn)]': tone === 'warn',
      'bg-[var(--danger-soft)] text-[var(--danger)]': tone === 'bad',
    }"
  >
    {{ label }}
  </span>
</template>
