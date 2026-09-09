import { prisma } from '@/lib/db';
import { estimateCost } from '@/lib/ai/cost';
import { DeepSeekProvider, type GenerationResult } from '@/lib/ai/provider';
import {
  buildSystemPrompt,
  buildUserMessage,
  type SummaryPromptInput,
} from '@/lib/ai/prompts/newsletter-summary';
import { validateSummary, type SummaryPayload } from '@/lib/ai/validate';
import { env } from '@/lib/env';
import { MAX_LEVEL } from '@/lib/levels';

export type SummarizeOutcome =
  | { status: 'summarized'; payload: SummaryPayload; model: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string }
  | { status: 'retryable'; reason: string }
  | { status: 'disabled' }
  | { status: 'cost_limit_reached' };

export type Summarizer = Pick<DeepSeekProvider, 'generateStructured'>;

export async function dailyCostUsd(now = new Date()): Promise<number> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const aggregate = await prisma.aIGenerationLog.aggregate({
    _sum: { costUsd: true },
    where: { createdAt: { gte: since } },
  });

  return Number(aggregate._sum.costUsd ?? 0);
}

async function logAttempt(
  articleId: string,
  attemptNumber: number,
  generation: GenerationResult,
  success: boolean,
  errorMessage?: string,
) {
  await prisma.aIGenerationLog.create({
    data: {
      purpose: 'NEWSLETTER_SUMMARY',
      model: generation.model,
      attemptNumber,
      inputTokens: generation.inputTokens,
      outputTokens: generation.outputTokens,
      cachedInputTokens: generation.cachedInputTokens,
      costUsd: estimateCost(
        generation.inputTokens,
        generation.outputTokens,
        generation.cachedInputTokens,
        generation.model,
      ),
      success,
      errorMessage,
      metadata: { articleId },
    },
  });
}

export async function summarizeArticle(
  article: SummaryPromptInput & { id: string },
  attemptNumber: number,
  provider: Summarizer = new DeepSeekProvider(),
): Promise<SummarizeOutcome> {
  if (!env.aiSummarizationEnabled) return { status: 'disabled' };

  if ((await dailyCostUsd()) >= env.aiDailyCostLimitUsd) {
    return { status: 'cost_limit_reached' };
  }

  const systemPrompt = buildSystemPrompt(MAX_LEVEL);
  const userMessage = buildUserMessage(article);

  // Une temperature basse au second essai rend la sortie plus deterministe.
  const temperatures = [0.3, 0.1];
  let lastFailure = '';

  for (const [index, temperature] of temperatures.entries()) {
    let generation: GenerationResult;

    try {
      generation = await provider.generateStructured(systemPrompt, userMessage, { temperature });
    } catch (error) {
      // Panne reseau ou 5xx : l'article reste a traiter, un run ulterieur retentera.
      return {
        status: 'retryable',
        reason: error instanceof Error ? error.message : 'erreur reseau',
      };
    }

    const validation = validateSummary(generation.content, article.sourceUrl);

    if (validation.ok) {
      await logAttempt(article.id, attemptNumber, generation, true);

      if (validation.payload.skipReason) {
        return { status: 'skipped', reason: validation.payload.skipReason };
      }
      return { status: 'summarized', payload: validation.payload, model: generation.model };
    }

    lastFailure = `${validation.reason}: ${validation.detail}`;
    await logAttempt(article.id, attemptNumber, generation, false, lastFailure);

    const worthRetrying =
      validation.reason === 'invalid_json' || validation.reason === 'schema_invalid';
    if (!worthRetrying || index === temperatures.length - 1) {
      return { status: 'failed', reason: validation.reason };
    }
  }

  return { status: 'failed', reason: lastFailure };
}
