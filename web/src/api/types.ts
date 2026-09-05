export type Recommendation = 'approve' | 'reject' | 'needs_more_info'
export type InvestorDecision =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'more_info_requested'

export interface Finding {
  claim: string
  evidence: string
  sourceUrl?: string
  confidence: number
}

export interface Verdict {
  id: string
  recommendation: Recommendation
  summary: string
  confirmed: Finding[]
  unconfirmed: Finding[]
  reasoning: string
  investorDecision: InvestorDecision
  investorNote: string | null
  createdAt: string
}

export interface Milestone {
  id: string
  title: string
  claim: string
  founderName: string
  proofType: string
  proofUrl: string | null
  proofText: string | null
  createdAt: string
  updatedAt: string
  verdict: Verdict | null
}

export interface CreateMilestonePayload {
  title: string
  claim: string
  founderName: string
  proofType: string
  proofUrl?: string
  proofText?: string
}
