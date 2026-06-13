import type { TranslationValues } from "../i18n/translate";

export type SearchTone = "error" | "idle" | "loading" | "success";

export interface SearchState {
  messageKey: string;
  requestId: string | null;
  requestNumber: number;
  resultCount: number;
  searchType: string | null;
  tone: SearchTone;
  values?: TranslationValues;
}

export const initialSearchState: SearchState = {
  messageKey: "status.ready",
  requestId: null,
  requestNumber: 0,
  resultCount: 0,
  searchType: null,
  tone: "idle",
};

export function createErrorState(
  requestNumber: number,
  messageKey: string,
  values?: TranslationValues,
): SearchState {
  const state: SearchState = {
    messageKey,
    requestId: null,
    requestNumber,
    resultCount: 0,
    searchType: null,
    tone: "error",
  };

  if (values !== undefined) {
    state.values = values;
  }

  return state;
}
