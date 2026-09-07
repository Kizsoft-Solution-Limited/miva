<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const showPassword = ref(false)
const role = ref<AuthRole>('founder')
const localError = ref<string | null>(null)

const title = computed(() => (mode.value === 'signin' ? 'Sign in' : 'Create account'))
const blurb = computed(() =>
  mode.value === 'signin'
    ? 'Email and password for your account.'
    : 'Pick Founder or Investor. No email hop.',
)

function homeForRole() {
  return roleStore.role === 'investor' ? '/investor' : '/founder'
}

async function bounceIfSignedIn() {
  if (!roleStore.hydrated) {
    await roleStore.restore()
  }
  if (roleStore.isSignedIn) {
    await router.replace(homeForRole())
  }
}

onMounted(() => {
  void bounceIfSignedIn()
})

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
    await router.replace(homeForRole())
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
        <div class="field-password">
          <input
            v-model="password"
            class="field field-password__input"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
            :minlength="mode === 'register' ? 8 : undefined"
            required
          />
          <button
            type="button"
            class="field-password__toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="!showPassword"
              class="field-password__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
              />
              <circle cx="12" cy="12" r="2.75" />
            </svg>
            <svg
              v-else
              class="field-password__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.5 3.5l17 17M9.9 9.9A2.75 2.75 0 0012 14.75c.55 0 1.06-.16 1.49-.44M6.5 6.7C4.4 8.1 2.75 10.4 2.25 12c0 0 3.75 6.75 9.75 6.75 1.7 0 3.2-.4 4.5-1M14.1 5.4A10.4 10.4 0 0112 5.25C6 5.25 2.25 12 2.25 12"
              />
            </svg>
          </button>
        </div>
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
