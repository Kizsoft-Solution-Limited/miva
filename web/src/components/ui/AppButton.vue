<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    class="rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'bg-slate-900 text-white hover:bg-slate-800': !variant || variant === 'primary',
      'bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50': variant === 'secondary',
      'bg-rose-700 text-white hover:bg-rose-600': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
