import type { Router } from 'vue-router'
import { useRoleStore } from '@/stores/role'
import { useToastStore } from '@/stores/toast'

/** Allow only in-app paths after login (open redirects off). */
export function safeLoginNext(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null
  if (raw.startsWith('//')) return null
  if (!(raw === '/founder' || raw.startsWith('/founder/') || raw === '/investor' || raw.startsWith('/investor/'))) {
    return null
  }
  return raw
}

export async function goSignIn(
  router: Router,
  message: string,
  nextPath?: string,
) {
  useToastStore().show(message, 'warn')
  const roleStore = useRoleStore()
  if (!roleStore.hydrated) {
    await roleStore.restore()
  }
  if (roleStore.isSignedIn) {
    await roleStore.signOut()
  }
  const next = safeLoginNext(nextPath)
  await router.push(next ? { path: '/login', query: { next } } : '/login')
}
