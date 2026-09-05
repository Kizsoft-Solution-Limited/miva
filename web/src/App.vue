<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="flex min-h-screen flex-col" :class="{ 'home-root': isHome }">
    <AppHeader />
    <main class="flex-1" :class="isHome ? '' : 'app-main'">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
