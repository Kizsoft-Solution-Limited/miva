<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <p class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-100" role="alert">
    {{ message }}
  </p>
</template>
