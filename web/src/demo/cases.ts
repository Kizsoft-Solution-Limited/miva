import type { CreateMilestonePayload } from '@/api/types'

export interface DemoCase {
  id: string
  label: string
  blurb: string
  payload: CreateMilestonePayload
}

export const demoCases: DemoCase[] = [
  {
    id: 'strong',
    label: 'Strong (live URL)',
    blurb: 'Public site that should confirm.',
    payload: {
      founderName: 'Demo Founder',
      title: 'Public site live',
      claim: 'BillSpot marketing site is live at billspot.co',
      proofType: 'url',
      proofUrl: 'https://billspot.co',
    },
  },
  {
    id: 'weak',
    label: 'Weak (no proof)',
    blurb: 'Bold claim, nothing to check.',
    payload: {
      founderName: 'Demo Founder',
      title: '10k users',
      claim: 'We hit 10,000 monthly active users last month',
      proofType: 'metric',
    },
  },
  {
    id: 'thin',
    label: 'Thin (bad link)',
    blurb: 'URL that should not fake-approve.',
    payload: {
      founderName: 'Demo Founder',
      title: 'Featured in TechCrunch',
      claim: 'TechCrunch covered our Series A last week',
      proofType: 'url',
      proofUrl: 'https://example.com/this-page-does-not-exist-miva-demo',
    },
  },
]
