<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <p
    class="rounded-[10px] border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]"
    role="alert"
  >
    {{ message }}
  </p>
</template>
