export interface VerifyMilestoneInput {
  title: string;
  claim: string;
  founderName?: string | null;
  proofType: string;
  proofUrl?: string | null;
  proofText?: string | null;
  proofFileName?: string | null;
  proofMime?: string | null;
  proofData?: string | null;
  orbioApiKey?: string | null;
}
