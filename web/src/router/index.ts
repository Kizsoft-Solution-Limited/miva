import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FounderView from '@/views/FounderView.vue'
import InvestorQueueView from '@/views/InvestorQueueView.vue'
import InvestorDetailView from '@/views/InvestorDetailView.vue'
import { applySeo, DEFAULT_DESCRIPTION, installJsonLd } from '@/seo'

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
      path: '/founder',
      component: FounderView,
      meta: {
        title: 'Submit milestone proof',
        description:
          'Submit a URL, repo, PDF, or excerpt. MIVA verifies what it can and returns a verdict for the investor.',
      },
    },
    {
      path: '/investor',
      component: InvestorQueueView,
      meta: {
        title: 'Investor verification queue',
        description:
          'Review agent verdicts for milestone claims. Approve release, reject, or ask for more info.',
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

router.afterEach((to) => {
  installJsonLd()
  applySeo({
    title: String(to.meta.title || 'MIVA'),
    description: String(to.meta.description || DEFAULT_DESCRIPTION),
    path: to.path,
    noindex: Boolean(to.meta.noindex),
  })
})
