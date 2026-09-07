<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const { message, tone } = storeToRefs(toast)
</script>

<template>
  <div class="app-toast-host" aria-live="polite" aria-atomic="true">
    <Transition name="app-toast">
      <div
        v-if="message"
        class="app-toast"
        :class="`app-toast--${tone}`"
        role="status"
      >
        <p>{{ message }}</p>
        <button type="button" class="app-toast__close" aria-label="Dismiss" @click="toast.clear()">
          ×
        </button>
      </div>
    </Transition>
  </div>
</template>
