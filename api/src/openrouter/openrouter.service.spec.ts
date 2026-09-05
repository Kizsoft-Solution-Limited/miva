import { describe, expect, it } from 'vitest';
import { OpenRouterService } from './openrouter.service.js';
import { ConfigService } from '@nestjs/config';

describe('OpenRouterService', () => {
  it('reports hasKey false when env key is empty', () => {
    const config = {
      get: (key: string) => (key === 'OPENROUTER_API_KEY' ? '' : undefined),
    } as ConfigService;
    const service = new OpenRouterService(config);
    expect(service.hasKey).toBe(false);
  });

  it('reports hasKey true when key is set', () => {
    const config = {
      get: (key: string) =>
        key === 'OPENROUTER_API_KEY' ? 'sk-or-v1-test' : undefined,
    } as ConfigService;
    const service = new OpenRouterService(config);
    expect(service.hasKey).toBe(true);
  });
});
