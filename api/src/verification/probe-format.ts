import type { UrlProbe } from '../lib/url-probe.js';
import type { GithubRepoProbe } from '../lib/github-repo.js';
import type { OnchainProbe } from '../lib/onchain.js';

export function formatProbe(probe: UrlProbe): string {
  const whoisLines = probe.whois
    ? [
        `domainHost: ${probe.whois.host}`,
        probe.whois.created
          ? `domainCreated: ${probe.whois.created} (domain registration — NOT company founding year)`
          : null,
        probe.whois.expires ? `domainExpires: ${probe.whois.expires}` : null,
        probe.whois.registrar ? `registrar: ${probe.whois.registrar}` : null,
        probe.whois.error ? `domainWhoisError: ${probe.whois.error}` : null,
      ].filter(Boolean)
    : [];

  if (!probe.ok) {
    return [
      `url: ${probe.url}`,
      `reachable: no`,
      probe.status != null ? `status: ${probe.status}` : null,
      probe.error ? `error: ${probe.error}` : null,
      ...whoisLines,
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [
    `url: ${probe.url}`,
    `reachable: yes`,
    `status: ${probe.status}`,
    probe.finalUrl && probe.finalUrl !== probe.url
      ? `finalUrl: ${probe.finalUrl}`
      : null,
    probe.contentType ? `contentType: ${probe.contentType}` : null,
    probe.title ? `title: ${probe.title}` : null,
    ...whoisLines,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatGithub(github: GithubRepoProbe): string {
  if (!github.ok) {
    return [
      `url: ${github.url}`,
      'ok: false',
      github.source ? `source: ${github.source}` : null,
      github.rateLimited ? 'rateLimited: true' : null,
      github.fullName ? `fullName: ${github.fullName}` : null,
      github.error ? `error: ${github.error}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [
    `url: ${github.url}`,
    'ok: true',
    github.source ? `source: ${github.source}` : null,
    github.rateLimited
      ? 'rateLimited: true (API blocked; HTML fallback — still usable)'
      : null,
    github.fullName ? `fullName: ${github.fullName}` : null,
    github.htmlUrl ? `htmlUrl: ${github.htmlUrl}` : null,
    github.description != null
      ? `description: ${github.description || '(none)'}`
      : null,
    github.defaultBranch ? `defaultBranch: ${github.defaultBranch}` : null,
    github.createdAt ? `createdAt: ${github.createdAt}` : null,
    github.pushedAt ? `pushedAt: ${github.pushedAt}` : null,
    github.stars != null ? `stars: ${github.stars}` : null,
    github.forks != null ? `forks: ${github.forks}` : null,
    github.latestReleaseTag
      ? `latestReleaseTag: ${github.latestReleaseTag}`
      : 'latestReleaseTag: (none or not found)',
    github.latestReleasePublishedAt
      ? `latestReleasePublishedAt: ${github.latestReleasePublishedAt}`
      : null,
    github.latestReleaseUrl
      ? `latestReleaseUrl: ${github.latestReleaseUrl}`
      : null,
    github.error ? `note: ${github.error}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatOnchain(onchain: OnchainProbe): string {
  if (!onchain.ok) {
    return [
      `input: ${onchain.input}`,
      `kind: ${onchain.kind}`,
      'ok: false',
      onchain.chainId != null ? `chainId: ${onchain.chainId}` : null,
      onchain.rpcUrl ? `rpcUrl: ${onchain.rpcUrl}` : null,
      onchain.address ? `address: ${onchain.address}` : null,
      onchain.txHash ? `txHash: ${onchain.txHash}` : null,
      onchain.explorerUrl ? `explorerUrl: ${onchain.explorerUrl}` : null,
      onchain.error ? `error: ${onchain.error}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [
    `input: ${onchain.input}`,
    `kind: ${onchain.kind}`,
    'ok: true',
    onchain.chainId != null ? `chainId: ${onchain.chainId}` : null,
    onchain.rpcUrl ? `rpcUrl: ${onchain.rpcUrl}` : null,
    onchain.address ? `address: ${onchain.address}` : null,
    onchain.txHash ? `txHash: ${onchain.txHash}` : null,
    onchain.isContract != null ? `isContract: ${onchain.isContract}` : null,
    onchain.bytecodeBytes != null
      ? `bytecodeBytes: ${onchain.bytecodeBytes}`
      : null,
    onchain.txStatus ? `txStatus: ${onchain.txStatus}` : null,
    onchain.blockNumber != null ? `blockNumber: ${onchain.blockNumber}` : null,
    onchain.explorerUrl ? `explorerUrl: ${onchain.explorerUrl}` : null,
    onchain.error ? `note: ${onchain.error}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
