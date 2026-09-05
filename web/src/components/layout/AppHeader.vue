<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import MivaLogo from '@/components/brand/MivaLogo.vue'

const route = useRoute()

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<template>
  <header class="app-chrome-header">
    <div class="app-chrome-header__inner">
      <RouterLink to="/" class="app-chrome-header__brand no-underline" aria-label="MIVA home">
        <MivaLogo :size="36" wordmark />
      </RouterLink>

      <nav class="app-chrome-header__nav" aria-label="Primary">
        <template v-if="isActive('/')">
          <a class="app-nav-link" href="#protocol">Protocol</a>
          <a class="app-nav-link" href="#try">Try</a>
        </template>
        <RouterLink
          v-else
          class="app-nav-link"
          :class="{ 'is-active': isActive('/') }"
          to="/"
        >
          Home
        </RouterLink>
        <RouterLink class="app-nav-link" :class="{ 'is-active': isActive('/founder') }" to="/founder">
          Founder
        </RouterLink>
        <RouterLink
          class="app-nav-link"
          :class="{ 'is-active': isActive('/investor') }"
          to="/investor"
        >
          Investor
        </RouterLink>
      </nav>

      <RouterLink to="/founder" class="app-chrome-header__cta">Submit proof</RouterLink>
    </div>
  </header>
</template>
