import type { ExaSearchViewResult } from "../exa/client";
import { createResultKey } from "./displayUrl";
import { logger } from "./logger";

export function dedupeResults(
  results: ExaSearchViewResult[],
  requestNumber: number,
): ExaSearchViewResult[] {
  const seen = new Map<string, number>();
  const dedupedResults: ExaSearchViewResult[] = [];

  results.forEach((result, index) => {
    const resultKey = createResultKey(result.url);
    const firstIndex = seen.get(resultKey);

    if (firstIndex !== undefined) {
      logger.warn("UI", "logs.resultDuplicateDiscarded", {
        values: {
          duplicateIndex: index + 1,
          keptIndex: firstIndex + 1,
          requestNumber,
        },
        details: {
          discardedUrl: result.url,
          keptUrl: dedupedResults[firstIndex]?.url,
          resultKey,
        },
      });
      return;
    }

    seen.set(resultKey, dedupedResults.length);
    dedupedResults.push(result);
  });

  if (dedupedResults.length !== results.length) {
    logger.info("UI", "logs.resultsDeduped", {
      values: { requestNumber },
      details: {
        dedupedCount: dedupedResults.length,
        originalCount: results.length,
        removedCount: results.length - dedupedResults.length,
      },
    });
  }

  return dedupedResults;
}
