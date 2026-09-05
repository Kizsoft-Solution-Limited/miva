<script setup lang="ts">
defineProps<{
  label: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="{
      'bg-slate-200 text-slate-800': !tone || tone === 'neutral',
      'bg-emerald-100 text-emerald-800': tone === 'good',
      'bg-amber-100 text-amber-900': tone === 'warn',
      'bg-rose-100 text-rose-800': tone === 'bad',
    }"
  >
    {{ label }}
  </span>
</template>
