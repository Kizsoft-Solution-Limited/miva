import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiErrorMessage } from '@/api/errors'
import {
  createMilestone,
  decideMilestone,
  getMilestone,
  listMilestones,
  recheckMilestone,
} from '@/api/milestones'
import type {
  CreateMilestonePayload,
  Milestone,
  UpdateProofPayload,
} from '@/api/types'

export const useMilestoneStore = defineStore('milestones', () => {
  const items = ref<Milestone[]>([])
  const current = ref<Milestone | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function sync(updated: Milestone) {
    current.value = updated
    items.value = items.value.map((m) => (m.id === updated.id ? updated : m))
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await listMilestones()
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not load milestones')
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value = null
    try {
      current.value = await getMilestone(id)
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not load milestone')
    } finally {
      loading.value = false
    }
  }

  async function submit(payload: CreateMilestonePayload) {
    loading.value = true
    error.value = null
    try {
      const created = await createMilestone(payload)
      current.value = created
      items.value = [created, ...items.value.filter((m) => m.id !== created.id)]
      return created
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not submit milestone')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function decide(
    id: string,
    decision: 'approved' | 'rejected' | 'more_info_requested',
    note?: string,
  ) {
    loading.value = true
    error.value = null
    try {
      const updated = await decideMilestone(id, decision, note)
      sync(updated)
      return updated
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not record decision')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function recheck(id: string, payload: UpdateProofPayload = {}) {
    loading.value = true
    error.value = null
    try {
      const updated = await recheckMilestone(id, payload)
      sync(updated)
      return updated
    } catch (e) {
      error.value = apiErrorMessage(e, 'Could not re-run check')
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    current,
    loading,
    error,
    fetchAll,
    fetchOne,
    submit,
    decide,
    recheck,
  }
})
