export const API_KEY_STORAGE_KEY = "eye.exaApiKey";
export const EXA_SEARCH_ENDPOINT = "https://api.exa.ai/search";
export const HIGHLIGHT_CHARACTER_LIMIT = 320;
export const LIVECRAWL_TIMEOUT_MS = 30_000;
export const MAX_RESULT_AGE_HOURS = 24 * 365 * 2;
export const SEARCH_RESULT_LIMIT = 15;

const safeIntegerSettings = [
  ["HIGHLIGHT_CHARACTER_LIMIT", HIGHLIGHT_CHARACTER_LIMIT],
  ["LIVECRAWL_TIMEOUT_MS", LIVECRAWL_TIMEOUT_MS],
  ["MAX_RESULT_AGE_HOURS", MAX_RESULT_AGE_HOURS],
  ["SEARCH_RESULT_LIMIT", SEARCH_RESULT_LIMIT],
] as const;

safeIntegerSettings.forEach(([name, value]) => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`E_CONFIG_UNSAFE_INTEGER:${name}`);
  }
});
