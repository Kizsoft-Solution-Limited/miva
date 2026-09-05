import axios from 'axios'
import type { CreateMilestonePayload, Milestone } from './types'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 90_000,
})


export async function listMilestones(): Promise<Milestone[]> {
  const { data } = await client.get<Milestone[]>('/milestones')
  return data
}

export async function getMilestone(id: string): Promise<Milestone> {
  const { data } = await client.get<Milestone>(`/milestones/${id}`)
  return data
}

export async function createMilestone(
  payload: CreateMilestonePayload,
): Promise<Milestone> {
  const { data } = await client.post<Milestone>('/milestones', payload)
  return data
}

export async function decideMilestone(
  id: string,
  decision: 'approved' | 'rejected' | 'more_info_requested',
  note?: string,
): Promise<Milestone> {
  const { data } = await client.patch<Milestone>(`/milestones/${id}/decision`, {
    decision,
    note,
  })
  return data
}
