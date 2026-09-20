import { describe, expect, it, vi } from 'vitest';
import { OpenRouterService } from './openrouter.service.js';
import { ConfigService } from '@nestjs/config';

describe('OpenRouterService', () => {
  it('reports hasKey false when env key is empty', () => {
    const config = {
      get: () => undefined,
    } as ConfigService;
    const service = new OpenRouterService(config);
    expect(service.hasKey).toBe(false);
  });

  it('reads OPENAI_API_KEY (Orbio)', () => {
    const config = {
      get: (key: string) =>
        key === 'OPENAI_API_KEY' ? 'sk-orbio-test' : undefined,
    } as ConfigService;
    const service = new OpenRouterService(config);
    expect(service.hasKey).toBe(true);
  });

  it('falls back to OPENROUTER_API_KEY', () => {
    const config = {
      get: (key: string) =>
        key === 'OPENROUTER_API_KEY' ? 'sk-or-v1-test' : undefined,
    } as ConfigService;
    const service = new OpenRouterService(config);
    expect(service.hasKey).toBe(true);
  });

  it('reports hasKeyFor with override when platform key missing', () => {
    const config = {
      get: () => undefined,
    } as ConfigService;
    const service = new OpenRouterService(config);
    expect(service.hasKey).toBe(false);
    expect(service.hasKeyFor('sk-orbio-user')).toBe(true);
  });

  it('parses Orbio key balance from /key', async () => {
    const config = {
      get: (key: string) =>
        key === 'OPENAI_BASE_URL' ? 'https://api.orbio.so/api/v1' : undefined,
    } as ConfigService;
    const service = new OpenRouterService(config);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        object: 'key',
        balance: { currency: 'USD', available: '12.34', used: '7.66' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    try {
      const balance = await service.fetchKeyBalance('sk-orbio-test');
      expect(balance).toEqual({
        available: '12.34',
        used: '7.66',
        currency: 'USD',
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.orbio.so/api/v1/key',
        expect.objectContaining({ method: 'GET' }),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
