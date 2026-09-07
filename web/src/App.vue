<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { useRoleStore } from '@/stores/role'

const route = useRoute()
const roleStore = useRoleStore()
const isHome = computed(() => route.path === '/')

onMounted(() => {
  void roleStore.restore()
})
</script>

<template>
  <div class="flex min-h-screen flex-col" :class="{ 'home-root': isHome }">
    <AppHeader />
    <main class="flex-1" :class="isHome ? '' : 'app-main'">
      <RouterView />
    </main>
    <AppFooter />
    <AppToast />
  </div>
</template>
