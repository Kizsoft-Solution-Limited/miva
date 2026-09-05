import { createRouter, createWebHistory } from 'vue-router'
import FounderView from '@/views/FounderView.vue'
import InvestorQueueView from '@/views/InvestorQueueView.vue'
import InvestorDetailView from '@/views/InvestorDetailView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/investor' },
    { path: '/founder', component: FounderView },
    { path: '/investor', component: InvestorQueueView },
    { path: '/investor/:id', component: InvestorDetailView },
  ],
})
