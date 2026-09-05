<script setup lang="ts">
withDefaults(
  defineProps<{
    wordmark?: boolean
    size?: number
  }>(),
  {
    wordmark: true,
    size: 36,
  },
)
</script>

<template>
  <span class="miva-logo inline-flex items-center gap-2.5" aria-hidden="true">
    <img
      src="/logo.png"
      alt=""
      :width="size"
      :height="size"
      class="miva-logo__mark shrink-0 rounded-[10px]"
      decoding="async"
    />
    <span
      v-if="wordmark"
      class="font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--night-fg)] leading-none"
    >
      MIVA
    </span>
  </span>
</template>
