import type { CreateMilestonePayload } from '@/api/types'

export interface DemoCase {
  id: string
  label: string
  blurb: string
  payload: CreateMilestonePayload
}

export const demoCases: DemoCase[] = [
  {
    id: 'repo',
    label: 'Hard (public repo)',
    blurb: 'Repo + release tag — more than a 200.',
    payload: {
      founderName: 'NestJS',
      title: 'Open-source release shipped',
      claim:
        'NestJS maintains a public GitHub repository at github.com/nestjs/nest with a published release tag',
      proofType: 'repo',
      proofUrl: 'https://github.com/nestjs/nest',
    },
  },
  {
    id: 'weak',
    label: 'Weak (no proof)',
    blurb: 'Bold claim, nothing to check.',
    payload: {
      founderName: 'Founder',
      title: '10k users',
      claim: 'We hit 10,000 monthly active users last month',
      proofType: 'metric',
    },
  },
  {
    id: 'thin',
    label: 'Thin (bad link)',
    blurb: 'Broken link — should not approve.',
    payload: {
      founderName: 'Founder',
      title: 'Featured in TechCrunch',
      claim: 'TechCrunch covered our Series A last week',
      proofType: 'url',
      proofUrl: 'https://example.com/this-page-does-not-exist-miva-demo',
    },
  },
  {
    id: 'strong',
    label: 'Strong (live URL)',
    blurb: 'Public site that should confirm.',
    payload: {
      founderName: 'Founder',
      title: 'Public site live',
      claim: 'Vue.js documentation site is live at vuejs.org',
      proofType: 'url',
      proofUrl: 'https://vuejs.org',
    },
  },
]
