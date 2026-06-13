import { translate, type TranslationValues } from "../i18n/translate";

const APP_TAG = "[Eye]";

type LogMethod = "debug" | "error" | "info" | "warn";

interface LogOptions {
  details?: unknown;
  values?: TranslationValues;
}

function writeLog(
  method: LogMethod,
  scope: string,
  messageKey: string,
  options: LogOptions = {},
): void {
  const prefix = `${APP_TAG}[${scope}] ${translate(messageKey, options.values)}`;

  if (options.details === undefined) {
    console[method](prefix);
    return;
  }

  console[method](prefix, options.details);
}

export const logger = {
  debug(scope: string, messageKey: string, options?: LogOptions): void {
    writeLog("debug", scope, messageKey, options);
  },
  error(scope: string, messageKey: string, options?: LogOptions): void {
    writeLog("error", scope, messageKey, options);
  },
  group(scope: string, messageKey: string, options?: LogOptions): void {
    console.groupCollapsed(
      `${APP_TAG}[${scope}] ${translate(messageKey, options?.values)}`,
    );
  },
  groupEnd(): void {
    console.groupEnd();
  },
  info(scope: string, messageKey: string, options?: LogOptions): void {
    writeLog("info", scope, messageKey, options);
  },
  warn(scope: string, messageKey: string, options?: LogOptions): void {
    writeLog("warn", scope, messageKey, options);
  },
};

export function formatUnknown(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ?? `${value.name}:${value.message}`;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized === undefined
      ? Object.prototype.toString.call(value)
      : serialized;
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.name : typeof error;
    return `E_UNSERIALIZABLE:${Object.prototype.toString.call(value)}:${reason}`;
  }
}
