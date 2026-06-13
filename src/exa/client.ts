import {
  EXA_SEARCH_ENDPOINT,
  HIGHLIGHT_CHARACTER_LIMIT,
  LIVECRAWL_TIMEOUT_MS,
  MAX_RESULT_AGE_HOURS,
} from "../config/search";
import { translate } from "../i18n/translate";
import { formatUnknown, logger } from "../lib/logger";
import {
  assertSearchInput,
  buildErrorMessage,
  parseResponseBody,
} from "./errors";
import {
  exaSearchResponseSchema,
  type SearchExaInput,
  type SearchExaOutput,
} from "./schema";
import { buildSummary } from "./summary";

export type {
  ExaSearchViewResult,
  SearchExaInput,
  SearchExaOutput,
} from "./schema";

function createSearchPayload(input: SearchExaInput): Record<string, unknown> {
  const query = input.query.trim();

  return {
    query,
    type: "auto",
    numResults: input.limit,
    contents: {
      maxAgeHours: MAX_RESULT_AGE_HOURS,
      livecrawlTimeout: LIVECRAWL_TIMEOUT_MS,
      highlights: {
        query,
        maxCharacters: HIGHLIGHT_CHARACTER_LIMIT,
      },
    },
  };
}

function logSearchStart(
  input: SearchExaInput,
  payload: Record<string, unknown>,
): void {
  logger.group("Exa", "logs.exaSearchStarted", {
    values: { requestNumber: input.requestNumber },
  });
  logger.info("Exa", "logs.exaRequestOverview", {
    values: { requestNumber: input.requestNumber },
    details: {
      endpoint: EXA_SEARCH_ENDPOINT,
      hasApiKey: input.apiKey.length > 0,
      limit: input.limit,
      queryLength: input.query.trim().length,
    },
  });
  logger.debug("Exa", "logs.exaRequestPayload", {
    values: { requestNumber: input.requestNumber },
    details: { ...payload, apiKey: "[redacted]" },
  });
}

async function sendSearchRequest(
  input: SearchExaInput,
  payload: Record<string, unknown>,
): Promise<Response> {
  return fetch(EXA_SEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": input.apiKey,
    },
    body: JSON.stringify(payload),
  });
}

export async function searchExa(
  input: SearchExaInput,
): Promise<SearchExaOutput> {
  assertSearchInput(input);
  const startedAt = performance.now();
  const payload = createSearchPayload(input);
  logSearchStart(input, payload);

  try {
    const response = await sendSearchRequest(input, payload);
    logger.info("Exa", "logs.exaResponseReceived", {
      values: { requestNumber: input.requestNumber },
      details: {
        durationMs: Math.round(performance.now() - startedAt),
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      },
    });

    const rawBody = await response.text();
    logger.debug("Exa", "logs.exaRawBodyLength", {
      values: { requestNumber: input.requestNumber },
      details: { characters: rawBody.length },
    });
    const parsedBody = parseResponseBody(
      rawBody,
      response,
      input.requestNumber,
    );

    if (!response.ok) {
      logger.error("Exa", "logs.exaNonSuccessBody", {
        values: { requestNumber: input.requestNumber },
        details: parsedBody,
      });
      throw new Error(
        buildErrorMessage(response.status, response.statusText, parsedBody),
      );
    }

    const parsed = exaSearchResponseSchema.safeParse(parsedBody);

    if (!parsed.success) {
      logger.error("Exa", "logs.exaShapeMismatch", {
        values: { requestNumber: input.requestNumber },
        details: {
          issues: parsed.error.issues,
          rawBody: parsedBody,
        },
      });
      throw new Error(translate("errors.exaUnexpectedShape"));
    }

    const results = parsed.data.results.map((result, index) => ({
      summary: buildSummary(result, index, input.requestNumber),
      title: result.title?.trim() || null,
      url: result.url,
    }));
    logger.info("Exa", "logs.exaSearchFinished", {
      values: { requestNumber: input.requestNumber },
      details: {
        requestId: parsed.data.requestId,
        resultCount: results.length,
        searchType: parsed.data.searchType ?? null,
        totalDurationMs: Math.round(performance.now() - startedAt),
      },
    });

    return {
      requestId: parsed.data.requestId,
      results,
      searchType: parsed.data.searchType ?? null,
    };
  } catch (error: unknown) {
    logger.error("Exa", "logs.exaSearchFailed", {
      values: { requestNumber: input.requestNumber },
      details: { error: formatUnknown(error) },
    });
    throw error;
  } finally {
    logger.groupEnd();
  }
}
