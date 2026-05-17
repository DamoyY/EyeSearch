const APP_TAG = '[Eye]';

type LogMethod = 'debug' | 'info' | 'warn' | 'error';

function writeLog(method: LogMethod, scope: string, message: string, details?: unknown): void {
  const prefix = `${APP_TAG}[${scope}] ${message}`;

  if (details === undefined) {
    console[method](prefix);
    return;
  }

  console[method](prefix, details);
}

export const logger = {
  debug(scope: string, message: string, details?: unknown): void {
    writeLog('debug', scope, message, details);
  },
  info(scope: string, message: string, details?: unknown): void {
    writeLog('info', scope, message, details);
  },
  warn(scope: string, message: string, details?: unknown): void {
    writeLog('warn', scope, message, details);
  },
  error(scope: string, message: string, details?: unknown): void {
    writeLog('error', scope, message, details);
  },
  group(scope: string, message: string): void {
    console.groupCollapsed(`${APP_TAG}[${scope}] ${message}`);
  },
  groupEnd(): void {
    console.groupEnd();
  },
};

export function formatUnknown(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ?? `${value.name}: ${value.message}`;
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
