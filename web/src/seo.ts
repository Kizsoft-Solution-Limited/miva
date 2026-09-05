export const SITE_NAME = 'MIVA'
export const SITE_TAGLINE = 'Milestone Verification Agent'
export const DEFAULT_DESCRIPTION =
  'MIVA checks founder milestone proof against live sources and returns an auditable verdict. Investors still decide.'

export function siteUrl(): string {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  if (raw) return raw
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'https://miva.local'
}

export interface SeoPayload {
  title: string
  description: string
  path?: string
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function applySeo(payload: SeoPayload) {
  const title = payload.title.includes(SITE_NAME)
    ? payload.title
    : `${payload.title} · ${SITE_NAME}`
  const url = `${siteUrl()}${payload.path || '/'}`

  document.title = title
  upsertMeta('name', 'description', payload.description)
  upsertMeta('name', 'robots', payload.noindex ? 'noindex,nofollow' : 'index,follow')
  const image = `${siteUrl()}/og.png`
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', payload.description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:image', image)
  upsertMeta('property', 'og:image:type', 'image/png')
  upsertMeta('property', 'og:image:width', '1200')
  upsertMeta('property', 'og:image:height', '630')
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', payload.description)
  upsertMeta('name', 'twitter:image', image)
  upsertLink('canonical', url)
}

export function installJsonLd() {
  const id = 'miva-jsonld'
  if (document.getElementById(id)) return

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl()}/#website`,
        url: siteUrl(),
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${siteUrl()}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl()}/#organization`,
        name: SITE_NAME,
        url: siteUrl(),
        description: SITE_TAGLINE,
        logo: `${siteUrl()}/logo.png`,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl()}/#app`,
        name: SITE_NAME,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: DEFAULT_DESCRIPTION,
        image: `${siteUrl()}/logo.png`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Founder milestone proof submission',
          'Live web search verification',
          'PDF document reading',
          'Structured JSON verdicts',
          'Investor approve / reject / needs more info',
        ],
      },
    ],
  }

  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}
