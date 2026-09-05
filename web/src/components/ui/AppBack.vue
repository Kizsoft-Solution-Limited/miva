<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  to: string
  label?: string
}>()
</script>

<template>
  <RouterLink :to="to" class="app-back">
    <span class="app-back__icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M10 3.5L5.5 8 10 12.5"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span>{{ label || 'Back' }}</span>
  </RouterLink>
</template>
