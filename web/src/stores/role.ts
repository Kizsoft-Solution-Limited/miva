import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchMe, login, logout, register, type AuthRole } from '@/api/auth'
import { apiErrorMessage } from '@/api/errors'

export type { AuthRole }

export const useRoleStore = defineStore('role', () => {
  const role = ref<AuthRole | null>(null)
  const email = ref<string | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)
  const hydrated = ref(false)

  const isSignedIn = computed(() => Boolean(role.value && email.value))
  const isInvestor = computed(() => isSignedIn.value && role.value === 'investor')
  const isFounder = computed(() => isSignedIn.value && role.value === 'founder')

  function persist(session: { role: AuthRole; email: string }) {
    role.value = session.role
    email.value = session.email
    hydrated.value = true
  }

  function clearSession() {
    role.value = null
    email.value = null
  }

  async function signIn(input: { email: string; password: string }) {
    busy.value = true
    error.value = null
    try {
      const session = await login(input)
      persist(session)
      return session
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not sign in')
      throw e
    } finally {
      busy.value = false
    }
  }

  async function signUp(input: {
    email: string
    password: string
    role: AuthRole
  }) {
    busy.value = true
    error.value = null
    try {
      const session = await register(input)
      persist(session)
      return session
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not create account')
      throw e
    } finally {
      busy.value = false
    }
  }

  async function restore() {
    try {
      const me = await fetchMe()
      role.value = me.role
      email.value = me.email
    } catch {
      clearSession()
    } finally {
      hydrated.value = true
    }
  }

  async function signOut() {
    try {
      await logout()
    } catch {}
    clearSession()
    error.value = null
  }

  return {
    role,
    email,
    busy,
    error,
    hydrated,
    isInvestor,
    isFounder,
    isSignedIn,
    signIn,
    signUp,
    restore,
    signOut,
  }
})
