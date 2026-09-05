<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  /** Full-width on mobile; shrinks on sm+. */
  wide?: boolean
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    class="items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="{
      'flex w-full sm:inline-flex sm:w-auto': wide,
      'inline-flex': !wide,
      'bg-[var(--signal)] text-[#052816] shadow-[0_0_24px_var(--glow)] hover:bg-[var(--accent-hover)]':
        !variant || variant === 'primary',
      'border border-[var(--line-strong)] bg-black/25 text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal)]':
        variant === 'secondary',
      'bg-[var(--danger)] text-[#1a0808] hover:brightness-110': variant === 'danger',
    }"
  >
    <slot />
  </button>
</template>
