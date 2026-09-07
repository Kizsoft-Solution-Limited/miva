import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FounderView from '@/views/FounderView.vue'
import InvestorQueueView from '@/views/InvestorQueueView.vue'
import InvestorDetailView from '@/views/InvestorDetailView.vue'
import LoginView from '@/views/LoginView.vue'
import { applySeo, DEFAULT_DESCRIPTION, installJsonLd } from '@/seo'
import { useRoleStore } from '@/stores/role'
import { useToastStore } from '@/stores/toast'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: {
        title: 'MIVA — Milestone Verification Agent',
        description: DEFAULT_DESCRIPTION,
      },
    },
    {
      path: '/login',
      component: LoginView,
      meta: {
        title: 'Sign in',
        description: 'Create an account or sign in.',
      },
    },
    {
      path: '/founder',
      component: FounderView,
      meta: {
        title: 'Submit milestone proof',
        description:
          'Submit a URL, repo, PDF, or excerpt. MIVA verifies what it can and returns a verdict for the investor.',
        requiresFounder: true,
      },
    },
    {
      path: '/investor',
      component: InvestorQueueView,
      meta: {
        title: 'Investor verification queue',
        description:
          'Review agent verdicts for milestone claims. Approve, reject, or ask for more info.',
      },
    },
    {
      path: '/investor/:id',
      component: InvestorDetailView,
      meta: {
        title: 'Investor review',
        description:
          'Read confirmed and unconfirmed findings, sources, and reasoning — then make the call.',
        noindex: true,
      },
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 72 }
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresFounder) return true

  const roleStore = useRoleStore()
  if (!roleStore.hydrated) {
    await roleStore.restore()
  }
  if (roleStore.isFounder) return true

  useToastStore().show('Sign in as Founder to submit proof.', 'warn')
  return '/login'
})

router.afterEach((to) => {
  installJsonLd()
  applySeo({
    title: String(to.meta.title || 'MIVA'),
    description: String(to.meta.description || DEFAULT_DESCRIPTION),
    path: to.path,
    noindex: Boolean(to.meta.noindex),
  })
})
