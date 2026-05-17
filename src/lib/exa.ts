import { z } from 'zod';

import { formatUnknown, logger } from './logger';

const EXA_SEARCH_ENDPOINT = 'https://api.exa.ai/search';

const exaSearchResultSchema = z.object({
  url: z.string().url(),
  highlights: z.array(z.string()).optional(),
});

const exaSearchResponseSchema = z.object({
  requestId: z.string(),
  searchType: z.string().optional(),
  results: z.array(exaSearchResultSchema),
});

export type ExaSearchResult = z.infer<typeof exaSearchResultSchema>;

export interface ExaSearchViewResult {
  url: string;
  summary: string;
}

export interface SearchExaInput {
  apiKey: string;
  query: string;
  limit: number;
  requestNumber: number;
}

export interface SearchExaOutput {
  requestId: string;
  searchType: string | null;
  results: ExaSearchViewResult[];
}

function normalizeSummary(summary: string): string {
  return summary.replaceAll('\n[...]\n', ' | ');
}

function buildSummary(result: ExaSearchResult, resultIndex: number, requestNumber: number): string {
  const highlights = result.highlights?.map((entry) => entry.trim()).filter((entry) => entry.length > 0);

  if (highlights !== undefined && highlights.length > 0) {
    if (highlights.length > 1) {
      logger.info('Exa', `第 ${requestNumber} 次搜索的第 ${resultIndex + 1} 条结果返回了多个 highlights`, {
        url: result.url,
        highlightCount: highlights.length,
      });
    }

    return normalizeSummary(highlights.join('\n\n'));
  }

  logger.warn('Exa', `第 ${requestNumber} 次搜索的第 ${resultIndex + 1} 条结果没有可用 highlights`, {
    url: result.url,
  });
  return 'Exa 未返回 highlights。';
}

function buildErrorMessage(status: number, statusText: string, body: unknown): string {
  if (body !== null && typeof body === 'object') {
    const candidate = body as {
      error?: { message?: unknown; detail?: unknown };
      message?: unknown;
      detail?: unknown;
    };

    const nestedErrorMessage = candidate.error?.message;
    if (typeof nestedErrorMessage === 'string' && nestedErrorMessage.trim().length > 0) {
      return `Exa 请求失败（${status} ${statusText}）：${nestedErrorMessage}`;
    }

    if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
      return `Exa 请求失败（${status} ${statusText}）：${candidate.message}`;
    }

    if (typeof candidate.detail === 'string' && candidate.detail.trim().length > 0) {
      return `Exa 请求失败（${status} ${statusText}）：${candidate.detail}`;
    }
  }

  return `Exa 请求失败（${status} ${statusText}）`;
}

export async function searchExa(input: SearchExaInput): Promise<SearchExaOutput> {
  const query = input.query.trim();
  const startedAt = performance.now();
  const payload = {
    query,
    type: 'auto' as const,
    numResults: input.limit,
    contents: {
      maxAgeHours: 2,
      highlights: {
        query,
        maxCharacters: 300,
      },
    },
  };

  logger.group('Exa', `#${input.requestNumber} 搜索开始`);
  logger.info('Exa', `请求概览 #${input.requestNumber}`, {
    endpoint: EXA_SEARCH_ENDPOINT,
    queryLength: query.length,
    limit: input.limit,
    hasApiKey: input.apiKey.length > 0,
  });
  logger.debug('Exa', `请求体 #${input.requestNumber}`, {
    ...payload,
    apiKey: '[redacted]',
  });

  try {
    const response = await fetch(EXA_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': input.apiKey,
      },
      body: JSON.stringify(payload),
    });

    logger.info('Exa', `收到响应 #${input.requestNumber}`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      durationMs: Math.round(performance.now() - startedAt),
    });

    const rawBody = await response.text();
    logger.debug('Exa', `原始响应长度 #${input.requestNumber}`, {
      characters: rawBody.length,
    });

    let parsedBody: unknown = null;
    if (rawBody.length > 0) {
      try {
        parsedBody = JSON.parse(rawBody) as unknown;
      } catch (error: unknown) {
        logger.error('Exa', `JSON 解析失败 #${input.requestNumber}`, {
          error: formatUnknown(error),
          rawSnippet: rawBody.slice(0, 500),
        });
        throw new Error(`Exa 返回了无法解析的 JSON：${response.status} ${response.statusText}`);
      }
    }

    if (!response.ok) {
      logger.error('Exa', `非 2xx 响应体 #${input.requestNumber}`, parsedBody);
      throw new Error(buildErrorMessage(response.status, response.statusText, parsedBody));
    }

    const parsed = exaSearchResponseSchema.safeParse(parsedBody);
    if (!parsed.success) {
      logger.error('Exa', `响应结构校验失败 #${input.requestNumber}`, {
        issues: parsed.error.issues,
        rawBody: parsedBody,
      });
      throw new Error('Exa 响应结构与预期不符，请查看浏览器控制台。');
    }

    const results = parsed.data.results.map((result, index) => ({
      url: result.url,
      summary: buildSummary(result, index, input.requestNumber),
    }));

    logger.info('Exa', `搜索完成 #${input.requestNumber}`, {
      requestId: parsed.data.requestId,
      searchType: parsed.data.searchType ?? null,
      resultCount: results.length,
      totalDurationMs: Math.round(performance.now() - startedAt),
    });
    logger.debug('Exa', `结果预览 #${input.requestNumber}`, results.map((result, index) => ({
      index: index + 1,
      url: result.url,
      summaryPreview: result.summary.slice(0, 180),
    })));
    console.table(results.map((result, index) => ({
      index: index + 1,
      url: result.url,
      summaryPreview: result.summary.slice(0, 120),
    })));

    return {
      requestId: parsed.data.requestId,
      searchType: parsed.data.searchType ?? null,
      results,
    };
  } catch (error: unknown) {
    logger.error('Exa', `搜索失败 #${input.requestNumber}`, {
      error: formatUnknown(error),
    });
    throw error;
  } finally {
    logger.groupEnd();
  }
}
