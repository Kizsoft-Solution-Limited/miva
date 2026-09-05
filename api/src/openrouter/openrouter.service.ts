import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenRouterService {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENROUTER_API_KEY') || 'missing-key',
      baseURL:
        this.config.get<string>('OPENROUTER_BASE_URL') ||
        'https://openrouter.ai/api/v1',
    });
  }

  get openai(): OpenAI {
    return this.client;
  }

  get hasKey(): boolean {
    const key = this.config.get<string>('OPENROUTER_API_KEY');
    return Boolean(key && key.trim().length > 0);
  }
}
