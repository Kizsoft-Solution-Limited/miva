<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ErrorBanner from '@/components/ui/ErrorBanner.vue'
import AppBack from '@/components/ui/AppBack.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useRoleStore, type AuthRole } from '@/stores/role'

const router = useRouter()
const roleStore = useRoleStore()

const mode = ref<'signin' | 'register'>('signin')
const email = ref('')
const password = ref('')
const role = ref<AuthRole>('founder')
const localError = ref<string | null>(null)

const title = computed(() => (mode.value === 'signin' ? 'Sign in' : 'Create account'))
const blurb = computed(() =>
  mode.value === 'signin'
    ? 'Email and password for your account.'
    : 'No email verification.',
)

async function submit() {
  localError.value = null
  const mail = email.value.trim()
  const pass = password.value
  if (!mail || !pass) {
    localError.value = 'Email and password are required.'
    return
  }
  if (mode.value === 'register' && pass.length < 8) {
    localError.value = 'Password must be at least 8 characters.'
    return
  }
  try {
    if (mode.value === 'register') {
      await roleStore.signUp({ email: mail, password: pass, role: role.value })
    } else {
      await roleStore.signIn({ email: mail, password: pass })
    }
    const next = roleStore.role === 'investor' ? '/investor' : '/founder'
    await router.replace(next)
  } catch {
    localError.value = roleStore.error
  }
}
</script>

<template>
  <div class="ws-page mx-auto max-w-lg space-y-6">
    <AppBack to="/" label="Home" />

    <header class="ws-hero !mb-0">
      <div>
        <p class="eyebrow">Account</p>
        <h1>{{ title }}</h1>
        <p>{{ blurb }}</p>
      </div>
    </header>

    <div class="login-mode" role="tablist" aria-label="Auth mode">
      <button
        type="button"
        role="tab"
        class="login-mode__btn"
        :class="{ 'is-active': mode === 'signin' }"
        :aria-selected="mode === 'signin'"
        @click="mode = 'signin'"
      >
        Sign in
      </button>
      <button
        type="button"
        role="tab"
        class="login-mode__btn"
        :class="{ 'is-active': mode === 'register' }"
        :aria-selected="mode === 'register'"
        @click="mode = 'register'"
      >
        Create account
      </button>
    </div>

    <ErrorBanner v-if="localError || roleStore.error" :message="localError || roleStore.error || ''" />

    <form class="surface space-y-4 p-5 sm:p-6" @submit.prevent="submit">
      <label class="block text-sm">
        <span class="mb-1.5 block font-bold text-[var(--ink)]">Email</span>
        <input
          v-model="email"
          class="field"
          type="email"
          name="email"
          autocomplete="username"
          required
        />
      </label>

      <label class="block text-sm">
        <span class="mb-1.5 block font-bold text-[var(--ink)]">Password</span>
        <input
          v-model="password"
          class="field"
          type="password"
          name="password"
          :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
          :minlength="mode === 'register' ? 8 : undefined"
          required
        />
      </label>

      <div v-if="mode === 'register'" class="login-role-pick">
        <label class="login-role-pick__option" :class="{ 'is-active': role === 'founder' }">
          <input v-model="role" type="radio" name="role" value="founder" class="sr-only" />
          <span class="font-bold">Founder</span>
        </label>
        <label class="login-role-pick__option" :class="{ 'is-active': role === 'investor' }">
          <input v-model="role" type="radio" name="role" value="investor" class="sr-only" />
          <span class="font-bold">Investor</span>
        </label>
      </div>

      <AppButton type="submit" wide :disabled="roleStore.busy">
        {{ mode === 'register' ? 'Create account' : 'Sign in' }}
      </AppButton>
    </form>

    <p v-if="roleStore.isSignedIn" class="text-sm text-[var(--muted)]">
      Signed in as
      <span class="font-bold text-[var(--ink)]">{{ roleStore.email }}</span>
      ({{ roleStore.role }}).
      <button type="button" class="ml-1 font-bold text-[var(--accent)] underline" @click="roleStore.signOut()">
        Sign out
      </button>
    </p>
  </div>
</template>
