import axios from 'axios'
import type {
  CreateMilestonePayload,
  Milestone,
  UpdateProofPayload,
} from './types'

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  '/api'

const client = axios.create({
  baseURL,
  timeout: 90_000,
})

function toFormData(
  fields: Record<string, string | boolean | undefined>,
  file?: File | null,
) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue
    body.append(key, String(value))
  }
  if (file) body.append('file', file)
  return body
}

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
  if (payload.file) {
    const body = toFormData(
      {
        title: payload.title,
        claim: payload.claim,
        founderName: payload.founderName,
        proofType: payload.proofType,
        proofUrl: payload.proofUrl,
        proofText: payload.proofText,
      },
      payload.file,
    )
    const { data } = await client.post<Milestone>('/milestones', body)
    return data
  }

  const { data } = await client.post<Milestone>('/milestones', {
    title: payload.title,
    claim: payload.claim,
    founderName: payload.founderName,
    proofType: payload.proofType,
    proofUrl: payload.proofUrl || undefined,
    proofText: payload.proofText || undefined,
  })
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

export async function recheckMilestone(
  id: string,
  payload: UpdateProofPayload = {},
): Promise<Milestone> {
  if (payload.file) {
    const body = toFormData(
      {
        claim: payload.claim,
        proofType: payload.proofType,
        proofUrl: payload.proofUrl,
        proofText: payload.proofText,
        clearFile: payload.clearFile,
      },
      payload.file,
    )
    const { data } = await client.post<Milestone>(`/milestones/${id}/recheck`, body)
    return data
  }

  const { data } = await client.post<Milestone>(`/milestones/${id}/recheck`, {
    claim: payload.claim,
    proofType: payload.proofType,
    proofUrl: payload.proofUrl || undefined,
    proofText: payload.proofText || undefined,
    clearFile: payload.clearFile,
  })
  return data
}
