import { describe, expect, it } from 'vitest';
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
});
