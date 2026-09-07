import type { Router } from 'vue-router'
import type { DemoRole } from '@/stores/role'
import { useToastStore } from '@/stores/toast'

export async function goSignIn(
  router: Router,
  role: DemoRole,
  nextPath: string,
  message: string,
) {
  useToastStore().show(message, 'warn')
  await router.push({
    path: '/login',
    query: { as: role, next: nextPath },
  })
}
