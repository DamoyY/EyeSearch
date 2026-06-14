import { useRef, useState } from "react";

import { SEARCH_RESULT_LIMIT } from "../config/search";
import { translate } from "../i18n/translate";
import { searchExa, type ExaSearchViewResult } from "../exa/client";
import { formatUnknown, logger } from "../lib/logger";
import { dedupeResults } from "../lib/results";
import { persistStoredApiKey, readStoredApiKey } from "../lib/storage";
import {
  createErrorState,
  initialSearchState,
  type SearchState,
} from "./searchState";

export interface EyeSearchController {
  apiKey: string;
  handleApiKeyChange: (nextApiKey: string) => void;
  hasQueryText: boolean;
  hasUnsavedApiKey: boolean;
  isSearching: boolean;
  query: string;
  results: ExaSearchViewResult[];
  runSearch: () => Promise<void>;
  saveApiKey: () => void;
  searchState: SearchState;
  setQuery: (nextQuery: string) => void;
  shouldShowStatus: boolean;
  statusMessage: string;
}

function createLoadingState(requestNumber: number, query: string): SearchState {
  return {
    messageKey: "status.searching",
    requestId: null,
    requestNumber,
    resultCount: 0,
    searchType: null,
    tone: "loading",
    values: { query },
  };
}

function createSuccessState(
  requestNumber: number,
  resultCount: number,
  requestId: string,
  searchType: string | null,
): SearchState {
  return {
    messageKey: "status.searchComplete",
    requestId,
    requestNumber,
    resultCount,
    searchType,
    tone: "success",
    values: { count: resultCount },
  };
}

export function useEyeSearch(): EyeSearchController {
  const [apiKey, setApiKey] = useState(readStoredApiKey);
  const [savedApiKey, setSavedApiKey] = useState(apiKey);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExaSearchViewResult[]>([]);
  const [searchState, setSearchState] =
    useState<SearchState>(initialSearchState);
  const requestCounterRef = useRef(0);

  function handleApiKeyChange(nextApiKey: string): void {
    setApiKey(nextApiKey);
  }

  function saveApiKey(): void {
    try {
      persistStoredApiKey(apiKey);
      setSavedApiKey(apiKey);
    } catch (error: unknown) {
      setSearchState(
        createErrorState(requestCounterRef.current, "status.persistFailed"),
      );
      throw error;
    }
  }

  async function runSearch(): Promise<void> {
    const requestNumber = requestCounterRef.current + 1;
    requestCounterRef.current = requestNumber;
    const trimmedApiKey = apiKey.trim();
    const trimmedQuery = query.trim();

    logger.group("UI", "logs.searchSubmit", { values: { requestNumber } });

    try {
      logger.info("UI", "logs.inputValidation", {
        values: { requestNumber },
        details: {
          hasApiKey: trimmedApiKey.length > 0,
          queryLength: trimmedQuery.length,
        },
      });

      if (trimmedApiKey.length === 0) {
        logger.warn("UI", "logs.validationMissingApiKey", {
          values: { requestNumber },
        });
        setSearchState(createErrorState(requestNumber, "status.apiKeyMissing"));
        return;
      }

      if (trimmedQuery.length === 0) {
        logger.warn("UI", "logs.validationMissingQuery", {
          values: { requestNumber },
        });
        setSearchState(createErrorState(requestNumber, "status.queryMissing"));
        return;
      }

      setResults([]);
      setSearchState(createLoadingState(requestNumber, trimmedQuery));

      const response = await searchExa({
        apiKey: trimmedApiKey,
        limit: SEARCH_RESULT_LIMIT,
        query: trimmedQuery,
        requestNumber,
      });
      const dedupedResults = dedupeResults(response.results, requestNumber);

      setResults(dedupedResults);
      setSearchState(
        createSuccessState(
          requestNumber,
          dedupedResults.length,
          response.requestId,
          response.searchType,
        ),
      );
      logger.info("UI", "logs.searchComplete", {
        values: { requestNumber },
        details: {
          requestId: response.requestId,
          searchType: response.searchType,
          resultCount: dedupedResults.length,
          originalCount: response.results.length,
        },
      });
    } catch (error: unknown) {
      logger.error("UI", "logs.searchFailed", {
        values: { requestNumber },
        details: { error: formatUnknown(error) },
      });
      setSearchState(
        createErrorState(requestNumber, "status.searchFailed", {
          message:
            error instanceof Error ? error.message : formatUnknown(error),
        }),
      );
    } finally {
      logger.groupEnd();
    }
  }

  return {
    apiKey,
    handleApiKeyChange,
    hasQueryText: query.trim().length > 0,
    hasUnsavedApiKey: apiKey !== savedApiKey,
    isSearching: searchState.tone === "loading",
    query,
    results,
    runSearch,
    saveApiKey,
    searchState,
    setQuery,
    shouldShowStatus:
      searchState.tone === "error" || searchState.tone === "loading",
    statusMessage: translate(searchState.messageKey, searchState.values),
  };
}
