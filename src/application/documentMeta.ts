import { translate } from "../i18n/translate";
import { formatUnknown, logger } from "../lib/logger";

export function updateDocumentMetadata(): void {
  document.title = translate("document.title");
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );

  if (meta === null) {
    logger.error("App", "logs.metaDescriptionMissing");
    throw new Error(translate("errors.metaDescriptionMissing"));
  }

  meta.content = translate("document.description");
}

export function installGlobalErrorListeners(): () => void {
  const handleWindowError = (event: ErrorEvent): void => {
    logger.error("Global", "logs.windowError", {
      values: { message: event.message },
      details: {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: formatUnknown(event.error),
      },
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    logger.error("Global", "logs.unhandledRejection", {
      details: { reason: formatUnknown(event.reason) },
    });
  };

  logger.info("Global", "logs.globalListenersInstalled");
  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    logger.info("Global", "logs.globalListenersRemoved");
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}
