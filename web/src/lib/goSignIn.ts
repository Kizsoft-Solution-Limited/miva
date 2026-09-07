import type { Router } from 'vue-router'
import { useToastStore } from '@/stores/toast'

export async function goSignIn(router: Router, message: string) {
  useToastStore().show(message, 'warn')
  await router.push('/login')
}
