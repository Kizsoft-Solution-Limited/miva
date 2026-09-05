import { describe, expect, it } from 'vitest';
import { parseWhoisText } from './url-probe.js';

describe('parseWhoisText', () => {
  it('parses Creation Date and registrar from registry output', () => {
    const text = `
Domain Name: BILLSPOT.CO
Creation Date: 2024-04-12T19:53:21.0Z
Registry Expiry Date: 2027-04-12T23:59:59.0Z
Registrar: NameCheap, Inc.
`;
    expect(parseWhoisText('billspot.co', text)).toEqual({
      host: 'billspot.co',
      created: '2024-04-12',
      expires: '2027-04-12',
      registrar: 'NameCheap, Inc.',
    });
  });

  it('returns an error when no dates are present', () => {
    expect(parseWhoisText('example.com', 'No match for domain')).toEqual({
      host: 'example.com',
      error: 'WHOIS parsed but no dates found',
    });
  });
});
