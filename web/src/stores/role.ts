import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchMe, login, type DemoRole } from '@/api/auth'
import { getAuthToken, setAuthToken } from '@/api/http'
import { apiErrorMessage } from '@/api/errors'

export type { DemoRole }

const ROLE_KEY = 'miva.demoRole'

function readStoredRole(): DemoRole | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(ROLE_KEY)
  return raw === 'investor' || raw === 'founder' ? raw : null
}

export const useRoleStore = defineStore('role', () => {
  const token = ref<string | null>(getAuthToken())
  const role = ref<DemoRole | null>(token.value ? readStoredRole() : null)
  const busy = ref(false)
  const error = ref<string | null>(null)
  const hydrated = ref(false)

  if (!token.value && typeof localStorage !== 'undefined') {
    localStorage.removeItem(ROLE_KEY)
  }

  const isSignedIn = computed(() => Boolean(token.value && role.value))
  const isInvestor = computed(() => isSignedIn.value && role.value === 'investor')
  const isFounder = computed(() => isSignedIn.value && role.value === 'founder')

  function persistRole(next: DemoRole | null) {
    role.value = next
    if (typeof localStorage === 'undefined') return
    if (next) localStorage.setItem(ROLE_KEY, next)
    else localStorage.removeItem(ROLE_KEY)
  }

  async function setRole(next: DemoRole) {
    busy.value = true
    error.value = null
    try {
      const session = await login(next)
      setAuthToken(session.token)
      token.value = session.token
      persistRole(session.role)
      hydrated.value = true
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not sign in')
      throw e
    } finally {
      busy.value = false
    }
  }

  async function restore() {
    try {
      if (!token.value) {
        persistRole(null)
        return
      }
      try {
        const me = await fetchMe()
        persistRole(me.role)
      } catch {
        setAuthToken(null)
        token.value = null
        persistRole(null)
      }
    } finally {
      hydrated.value = true
    }
  }

  function signOut() {
    setAuthToken(null)
    token.value = null
    persistRole(null)
    error.value = null
  }

  return {
    role,
    token,
    busy,
    error,
    hydrated,
    isInvestor,
    isFounder,
    isSignedIn,
    setRole,
    restore,
    signOut,
  }
})
