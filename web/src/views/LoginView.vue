<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import AppBack from '@/components/ui/AppBack.vue'
import { useRoleStore, type DemoRole } from '@/stores/role'

const router = useRouter()
const roleStore = useRoleStore()
const localError = ref<string | null>(null)

async function signIn(role: DemoRole) {
  localError.value = null
  try {
    await roleStore.setRole(role)
    await router.replace(role === 'investor' ? '/investor' : '/founder')
  } catch {
    localError.value = roleStore.error
  }
}
</script>

<template>
  <div class="ws-page mx-auto max-w-2xl space-y-6">
    <AppBack to="/" label="Home" />

    <header class="ws-hero !mb-0">
      <div>
        <p class="eyebrow">Account</p>
        <h1>Sign in</h1>
        <p>Founder submits proof. Investor records the decision.</p>
      </div>
      <div class="ws-chip-row">
        <span class="ws-chip">Founder · Investor</span>
      </div>
    </header>

    <ErrorBanner v-if="localError || roleStore.error" :message="localError || roleStore.error || ''" />

    <div v-if="roleStore.isSignedIn" class="login-session surface">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Signed in
        </p>
        <p class="mt-1 text-base font-bold capitalize text-[var(--ink)]">
          {{ roleStore.role }}
        </p>
      </div>
      <button type="button" class="login-session__out" @click="roleStore.signOut()">
        Sign out
      </button>
    </div>

    <div class="login-roles" role="group" aria-label="Choose role">
      <button
        type="button"
        class="login-role"
        :class="{ 'is-active': roleStore.isFounder }"
        :disabled="roleStore.busy"
        @click="signIn('founder')"
      >
        <div class="login-role__top">
          <span class="login-role__mark" aria-hidden="true">F</span>
          <span class="ws-chip">submit</span>
        </div>
        <h2 class="login-role__title">Founder</h2>
        <p class="login-role__text">Submit proof and re-run checks when more info is needed.</p>
        <div class="login-role__foot">
          <span class="login-role__cta">Continue</span>
        </div>
      </button>

      <button
        type="button"
        class="login-role"
        :class="{ 'is-active': roleStore.isInvestor }"
        :disabled="roleStore.busy"
        @click="signIn('investor')"
      >
        <div class="login-role__top">
          <span class="login-role__mark login-role__mark--inv" aria-hidden="true">I</span>
          <span class="ws-chip">decide</span>
        </div>
        <h2 class="login-role__title">Investor</h2>
        <p class="login-role__text">Approve, reject, or ask for more on a pending verdict.</p>
        <div class="login-role__foot">
          <span class="login-role__cta">Continue</span>
        </div>
      </button>
    </div>
  </div>
</template>
