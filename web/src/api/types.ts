export type Recommendation = 'approve' | 'reject' | 'needs_more_info'
export type InvestorDecision =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'more_info_requested'
export type ProofType = 'url' | 'pdf' | 'repo' | 'text' | 'metric'

export interface Finding {
  claim: string
  evidence: string
  sourceUrl?: string
  confidence: number
}

export interface Verdict {
  id: string
  version: number
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
  proofFileName: string | null
  hasProofFile: boolean
  createdAt: string
  updatedAt: string
  verdict: Verdict | null
  verdictHistory: Verdict[]
  check?: {
    orbio: boolean
    webSearch: boolean
    pdf: boolean
    structuredJson: boolean
  }
}

export interface CreateMilestonePayload {
  title: string
  claim: string
  founderName: string
  proofType: ProofType
  proofUrl?: string
  proofText?: string
  file?: File | null
}

export interface UpdateProofPayload {
  claim?: string
  proofType?: ProofType
  proofUrl?: string
  proofText?: string
  clearFile?: boolean
  file?: File | null
}
