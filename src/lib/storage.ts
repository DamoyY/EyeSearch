import { API_KEY_STORAGE_KEY } from "../config/search";
import { formatUnknown, logger } from "./logger";

export function readStoredApiKey(): string {
  try {
    const storedApiKey = window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
    logger.info("Storage", "logs.storageRead", {
      details: {
        exists: storedApiKey.length > 0,
        length: storedApiKey.length,
      },
    });
    return storedApiKey;
  } catch (error: unknown) {
    logger.error("Storage", "logs.storageReadFailed", {
      details: { error: formatUnknown(error) },
    });
    throw error;
  }
}

export function persistStoredApiKey(apiKey: string): void {
  try {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    logger.debug("Storage", "logs.storagePersisted", {
      details: { length: apiKey.length },
    });
  } catch (error: unknown) {
    logger.error("Storage", "logs.storagePersistFailed", {
      details: { error: formatUnknown(error) },
    });
    throw error;
  }
}
