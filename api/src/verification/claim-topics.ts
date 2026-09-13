export function claimTopics(title: string, claim: string) {
  const text = `${title} ${claim}`.toLowerCase();
  return {
    companyAge:
      /\b(age|founded|founding|incorporated|incorporation|registry|how old|established|since\s+\d{4}|company age)\b/.test(
        text,
      ),
    founder:
      /\b(founder|co-?founder|ceo|linkedin|who\s+is|team lead|director)\b/.test(
        text,
      ),
    metric:
      /\b(metric|users|mau|dau|revenue|mrr|arr|gmv|growth|%\s*mo|customers|subscribers)\b/.test(
        text,
      ),
    liveSite:
      /\b(live|online|up|reachable|deployed|public site|website|domain|url)\b/.test(
        text,
      ),
    repo: /\b(repo|github|gitlab|commit|open\s*source|pull request)\b/.test(
      text,
    ),
    press: /\b(press|techcrunch|featured|covered|article|news)\b/.test(text),
    onchain:
      /\b(on-?chain|ethereum|mainnet|smart\s*contract|bytecode|tx\s*hash|transaction|etherscan|0x[a-f0-9]{40})\b/.test(
        text,
      ),
  };
}

export function isContextFinding(claim: string) {
  return claim.toLowerCase().startsWith('context ·');
}

export function stripContextPrefix(claim: string) {
  return claim.replace(/^context\s*·\s*/i, '').trim();
}
