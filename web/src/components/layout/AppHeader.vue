<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import MivaLogo from '@/components/brand/MivaLogo.vue'
import { useRoleStore } from '@/stores/role'

const route = useRoute()
const roleStore = useRoleStore()
const menuOpen = ref(false)

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function closeMenu() {
  menuOpen.value = false
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function signOut() {
  roleStore.signOut()
}

watch(() => route.fullPath, closeMenu)
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
        <RouterLink
          class="app-nav-link"
          :class="{ 'is-active': isActive('/investor') }"
          to="/investor"
        >
          Queue
        </RouterLink>
      </nav>

      <div class="app-chrome-header__auth">
        <template v-if="roleStore.isSignedIn">
          <span class="app-chrome-header__who font-mono">
            {{ roleStore.role }}
          </span>
          <button type="button" class="app-nav-link" @click="signOut">Sign out</button>
        </template>
        <RouterLink
          v-else
          to="/login"
          class="app-nav-link"
          :class="{ 'is-active': isActive('/login') }"
        >
          Sign in
        </RouterLink>
      </div>

      <RouterLink to="/founder" class="app-chrome-header__cta">Submit proof</RouterLink>

      <button
        type="button"
        class="app-chrome-header__menu-btn"
        :aria-expanded="menuOpen"
        aria-controls="app-mobile-nav"
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        @click="toggleMenu"
      >
        <svg v-if="!menuOpen" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <nav
      v-show="menuOpen"
      id="app-mobile-nav"
      class="app-chrome-header__mobile-nav"
      aria-label="Mobile"
    >
      <template v-if="isActive('/')">
        <a class="app-mobile-nav-link" href="#protocol" @click="closeMenu">Protocol</a>
        <a class="app-mobile-nav-link" href="#try" @click="closeMenu">Try</a>
      </template>
      <RouterLink
        v-else
        class="app-mobile-nav-link"
        :class="{ 'is-active': isActive('/') }"
        to="/"
        @click="closeMenu"
      >
        Home
      </RouterLink>
      <RouterLink
        class="app-mobile-nav-link"
        :class="{ 'is-active': isActive('/investor') }"
        to="/investor"
        @click="closeMenu"
      >
        Queue
      </RouterLink>
      <p v-if="roleStore.isSignedIn" class="app-mobile-nav-meta">
        Signed in as {{ roleStore.role }}
      </p>
      <RouterLink
        v-if="!roleStore.isSignedIn"
        class="app-mobile-nav-link"
        :class="{ 'is-active': isActive('/login') }"
        to="/login"
        @click="closeMenu"
      >
        Sign in
      </RouterLink>
      <button
        v-else
        type="button"
        class="app-mobile-nav-link text-left"
        @click="signOut(); closeMenu()"
      >
        Sign out
      </button>
    </nav>
  </header>
</template>
