import { translate } from "../i18n/translate";
import { formatUnknown, logger } from "../lib/logger";
import type { SearchExaInput } from "./schema";

export function parseResponseBody(
  rawBody: string,
  response: Response,
  requestNumber: number,
): unknown {
  if (rawBody.length === 0) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch (error: unknown) {
    logger.error("Exa", "logs.exaJsonParseFailed", {
      values: { requestNumber },
      details: {
        error: formatUnknown(error),
        rawSnippet: rawBody.slice(0, 500),
      },
    });
    throw new Error(
      translate("errors.exaInvalidJson", {
        status: response.status,
        statusText: response.statusText,
      }),
    );
  }
}

function extractErrorMessage(body: unknown): string | null {
  if (body === null || typeof body !== "object") {
    return null;
  }

  const candidate = body as {
    detail?: unknown;
    error?: { detail?: unknown; message?: unknown };
    message?: unknown;
  };
  const possibleMessages = [
    candidate.error?.message,
    candidate.error?.detail,
    candidate.message,
    candidate.detail,
  ];
  const message = possibleMessages.find(
    (entry) => typeof entry === "string" && entry.trim().length > 0,
  );

  return typeof message === "string" ? message : null;
}

export function buildErrorMessage(
  status: number,
  statusText: string,
  body: unknown,
): string {
  const message = extractErrorMessage(body);

  if (message !== null) {
    return translate("errors.exaHttpWithMessage", {
      message,
      status,
      statusText,
    });
  }

  return translate("errors.exaHttp", { status, statusText });
}

export function assertSearchInput(input: SearchExaInput): void {
  if (!Number.isSafeInteger(input.limit) || input.limit <= 0) {
    throw new Error(
      translate("errors.invalidResultLimit", { limit: input.limit }),
    );
  }
}
