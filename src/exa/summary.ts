import { translate } from "../i18n/translate";
import { logger } from "../lib/logger";
import type { ExaSearchResult } from "./schema";

function splitSegments(summary: string): string[] {
  return summary
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\n[...]\n", "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function buildSummary(
  result: ExaSearchResult,
  resultIndex: number,
  requestNumber: number,
): string[] {
  const highlights = result.highlights
    ?.map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (highlights !== undefined && highlights.length > 0) {
    if (highlights.length > 1) {
      logger.info("Exa", "logs.exaMultipleHighlights", {
        values: { index: resultIndex + 1, requestNumber },
        details: { highlightCount: highlights.length, url: result.url },
      });
    }

    return splitSegments(highlights.join("\n"));
  }

  logger.warn("Exa", "logs.exaMissingHighlights", {
    values: { index: resultIndex + 1, requestNumber },
    details: { url: result.url },
  });
  return [translate("results.missingHighlights")];
}
