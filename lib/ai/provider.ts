import OpenAI from 'openai';

import { env } from '@/lib/env';

export type GenerationResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  model: string;
};

export class DeepSeekProvider {
  private readonly client: OpenAI;

  constructor(private readonly model: string = env.deepseekModel) {
    this.client = new OpenAI({
      apiKey: env.deepseekApiKey,
      baseURL: env.deepseekBaseUrl,
    });
  }

  async generateStructured(
    systemPrompt: string,
    userMessage: string,
    options: { temperature: number },
  ): Promise<GenerationResult> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: options.temperature,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const usage = completion.usage;

    return {
      content: completion.choices[0]?.message?.content ?? '',
      inputTokens: usage?.prompt_tokens ?? 0,
      outputTokens: usage?.completion_tokens ?? 0,
      cachedInputTokens: usage?.prompt_tokens_details?.cached_tokens ?? 0,
      model: this.model,
    };
  }
}
