import { useEffect, type KeyboardEvent, type ReactElement } from "react";

import {
  installGlobalErrorListeners,
  updateDocumentMetadata,
} from "./application/documentMeta";
import { useEyeSearch } from "./application/useEyeSearch";
import { ResultsGallery } from "./components/ResultsGallery";
import { translate } from "./i18n/translate";
import { logger } from "./lib/logger";
import { css, cx } from "../styled-system/css";
import { input } from "../styled-system/recipes";

export default function App(): ReactElement {
  const controller = useEyeSearch();

  useEffect(() => {
    updateDocumentMetadata();
    logger.info("App", "logs.appMounted");

    return installGlobalErrorListeners();
  }, []);

  function handleApiKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    void controller.runSearch();
  }

  return (
    <main className={shellClass}>
      <input
        aria-label={translate("form.apiKeyLabel")}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        className={cx(input({ size: "lg" }), apiKeyClass)}
        inputMode="text"
        onChange={(event) => controller.handleApiKeyChange(event.target.value)}
        onKeyDown={handleApiKeyDown}
        placeholder={translate("form.apiKeyPlaceholder")}
        spellCheck={false}
        type="text"
        value={controller.apiKey}
      />

      <ResultsGallery results={controller.results} />

      <form
        className={searchFormClass}
        onSubmit={(event) => event.preventDefault()}
      >
        {controller.shouldShowStatus ? (
          <p className={statusClass}>{controller.statusMessage}</p>
        ) : null}
        <input
          aria-label={translate("form.queryLabel")}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className={cx(input({ size: "lg" }), queryClass)}
          disabled={controller.isSearching}
          onChange={(event) => controller.setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void controller.runSearch();
            }
          }}
          placeholder={translate("form.queryPlaceholder")}
          spellCheck={false}
          type="search"
          value={controller.query}
        />
      </form>
    </main>
  );
}

const shellClass = css({
  minH: "100vh",
  bg: "black",
  color: "white",
  fontFamily: "body",
  px: "4",
  pt: "16",
  pb: "20",
});

const apiKeyClass = css({
  position: "fixed",
  top: "4",
  right: "4",
  left: "4",
  zIndex: "sticky",
  w: "auto",
  borderColor: "gray.7",
  bg: "gray.a2",
  color: "white",
  textAlign: "center",
});

const searchFormClass = css({
  position: "fixed",
  right: "4",
  bottom: "4",
  left: "4",
  zIndex: "sticky",
  display: "grid",
  gap: "2",
});

const queryClass = css({
  w: "full",
  borderColor: "gray.7",
  bg: "gray.a2",
  color: "white",
  textAlign: "center",
});

const statusClass = css({
  m: "0",
  color: "gray.11",
  textAlign: "center",
  textStyle: "sm",
});
