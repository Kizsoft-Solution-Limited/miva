import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearOrbioKey,
  clearWallet,
  fetchMe,
  fetchOrbioBalance,
  login,
  logout,
  register,
  setOrbioKey,
  setWallet,
  type AuthRole,
} from '@/api/auth'
import { apiErrorMessage } from '@/api/errors'

export type { AuthRole }

export const useRoleStore = defineStore('role', () => {
  const role = ref<AuthRole | null>(null)
  const email = ref<string | null>(null)
  const hasOrbioKey = ref(false)
  const walletAddress = ref<string | null>(null)
  const orbioAvailable = ref<string | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)
  const hydrated = ref(false)

  const isSignedIn = computed(() => Boolean(role.value && email.value))
  const isInvestor = computed(
    () => isSignedIn.value && role.value === 'investor',
  )
  const isFounder = computed(() => isSignedIn.value && role.value === 'founder')

  function persist(session: {
    role: AuthRole
    email: string
    hasOrbioKey?: boolean
    walletAddress?: string | null
  }) {
    role.value = session.role
    email.value = session.email
    hasOrbioKey.value = Boolean(session.hasOrbioKey)
    walletAddress.value = session.walletAddress ?? null
    hydrated.value = true
  }

  function clearSession() {
    role.value = null
    email.value = null
    hasOrbioKey.value = false
    walletAddress.value = null
    orbioAvailable.value = null
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
      persist(me)
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

  async function saveOrbioKey(apiKey: string) {
    busy.value = true
    error.value = null
    try {
      const res = await setOrbioKey(apiKey)
      hasOrbioKey.value = res.hasOrbioKey
      await refreshOrbioBalance()
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not save Orbio key')
      throw e
    } finally {
      busy.value = false
    }
  }

  async function removeOrbioKey() {
    busy.value = true
    error.value = null
    try {
      const res = await clearOrbioKey()
      hasOrbioKey.value = res.hasOrbioKey
      orbioAvailable.value = null
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not clear Orbio key')
      throw e
    } finally {
      busy.value = false
    }
  }

  async function refreshOrbioBalance() {
    if (!hasOrbioKey.value) {
      orbioAvailable.value = null
      return
    }
    try {
      const bal = await fetchOrbioBalance()
      orbioAvailable.value = bal.available
    } catch {
      orbioAvailable.value = null
    }
  }

  async function saveWallet(address: string) {
    busy.value = true
    error.value = null
    try {
      const res = await setWallet(address)
      walletAddress.value = res.walletAddress
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not save wallet')
      throw e
    } finally {
      busy.value = false
    }
  }

  async function removeWallet() {
    busy.value = true
    error.value = null
    try {
      await clearWallet()
      walletAddress.value = null
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not clear wallet')
      throw e
    } finally {
      busy.value = false
    }
  }

  return {
    role,
    email,
    hasOrbioKey,
    walletAddress,
    orbioAvailable,
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
    saveOrbioKey,
    removeOrbioKey,
    refreshOrbioBalance,
    saveWallet,
    removeWallet,
  }
})
