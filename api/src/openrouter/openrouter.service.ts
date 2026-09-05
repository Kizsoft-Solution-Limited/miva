import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type ChatContentPart =
  | { type: 'text'; text: string }
  | {
      type: 'file';
      file: { filename: string; file_data: string };
    };

export interface OpenRouterChatInput {
  system: string;
  userText: string;
  pdfUrl?: string;
  webSearch?: boolean;
  model?: string;
}

export interface OpenRouterChatResult {
  content: string;
  citations: Array<{ url: string; title?: string; excerpt?: string }>;
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly client: OpenAI;
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('OPENROUTER_API_KEY')?.trim() || '';
    this.baseURL =
      this.config.get<string>('OPENROUTER_BASE_URL') ||
      'https://openrouter.ai/api/v1';
    this.client = new OpenAI({
      apiKey: this.apiKey || 'missing-key',
      baseURL: this.baseURL,
    });
  }

  get openai(): OpenAI {
    return this.client;
  }

  get hasKey(): boolean {
    return this.apiKey.length > 0;
  }

  async chatForVerification(
    input: OpenRouterChatInput,
  ): Promise<OpenRouterChatResult> {
    if (!this.hasKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const userContent: ChatContentPart[] = [
      { type: 'text', text: input.userText },
    ];

    if (input.pdfUrl) {
      userContent.push({
        type: 'file',
        file: {
          filename: this.filenameFromUrl(input.pdfUrl),
          file_data: input.pdfUrl,
        },
      });
    }

    const plugins: Array<Record<string, unknown>> = [];
    if (input.webSearch) {
      plugins.push({
        id: 'web',
        max_results: 5,
        search_prompt:
          'Live web results for this milestone claim. Cite real URLs only. Prefer the founder proof URL and reputable sources.',
      });
    }
    if (input.pdfUrl) {
      plugins.push({
        id: 'file-parser',
        pdf: { engine: 'cloudflare-ai' },
      });
    }

    const body: Record<string, unknown> = {
      model: input.model || 'openai/gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: userContent },
      ],
    };
    if (plugins.length) {
      body.plugins = plugins;
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Kizsoft-Solution-Limited/miva',
        'X-Title': 'MIVA',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    const payload = (await response.json()) as {
      error?: { message?: string };
      choices?: Array<{
        message?: {
          content?: string | null;
          annotations?: Array<{
            type?: string;
            url_citation?: {
              url?: string;
              title?: string;
              content?: string;
            };
          }>;
        };
      }>;
    };

    if (!response.ok) {
      const msg = payload.error?.message || `OpenRouter HTTP ${response.status}`;
      this.logger.error(`OpenRouter chat failed: ${msg}`);
      throw new Error(msg);
    }

    const message = payload.choices?.[0]?.message;
    const content = message?.content ?? '{}';
    const citations =
      message?.annotations
        ?.filter((a) => a.type === 'url_citation' && a.url_citation?.url)
        .map((a) => ({
          url: a.url_citation!.url!,
          title: a.url_citation?.title,
          excerpt: a.url_citation?.content,
        })) ?? [];

    return { content, citations };
  }

  private filenameFromUrl(url: string): string {
    try {
      const path = new URL(url).pathname;
      const name = path.split('/').filter(Boolean).pop();
      return name?.endsWith('.pdf') ? name : 'document.pdf';
    } catch {
      return 'document.pdf';
    }
  }
}
