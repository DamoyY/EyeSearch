import { useEffect, type FormEvent, type ReactElement } from "react";
import { Save as SaveIcon, Search as SearchIcon } from "lucide-react";

import {
  installGlobalErrorListeners,
  updateDocumentMetadata,
} from "./application/documentMeta";
import { useEyeSearch } from "./application/useEyeSearch";
import { ResultsGallery } from "./components/ResultsGallery";
import { translate } from "./i18n/translate";
import { logger } from "./lib/logger";
import { css, cx } from "../styled-system/css";
import { button, input } from "../styled-system/recipes";

export default function App(): ReactElement {
  const controller = useEyeSearch();

  useEffect(() => {
    updateDocumentMetadata();
    logger.info("App", "logs.appMounted");

    return installGlobalErrorListeners();
  }, []);

  function handleApiKeySubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!controller.hasUnsavedApiKey) {
      void controller.runSearch();
      return;
    }

    controller.saveApiKey();
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void controller.runSearch();
  }

  return (
    <main className={shellClass}>
      <form className={apiKeyFormClass} onSubmit={handleApiKeySubmit}>
        <input
          aria-label={translate("form.apiKeyLabel")}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className={cx(input({ size: "lg" }), sharedInputClass)}
          inputMode="text"
          onChange={(event) =>
            controller.handleApiKeyChange(event.target.value)
          }
          placeholder={translate("form.apiKeyPlaceholder")}
          spellCheck={false}
          type="text"
          value={controller.apiKey}
        />
        {controller.hasUnsavedApiKey ? (
          <button
            aria-label={translate("form.saveApiKey")}
            className={cx(button({ size: "lg" }), actionButtonClass)}
            title={translate("form.saveApiKey")}
            type="submit"
          >
            <SaveIcon aria-hidden="true" className={iconClass} />
          </button>
        ) : null}
      </form>

      <ResultsGallery results={controller.results} />

      <form className={searchFormClass} onSubmit={handleSearchSubmit}>
        {controller.shouldShowStatus ? (
          <p className={statusClass}>{controller.statusMessage}</p>
        ) : null}
        <div className={searchInputRowClass}>
          <input
            aria-label={translate("form.queryLabel")}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={cx(input({ size: "lg" }), sharedInputClass)}
            disabled={controller.isSearching}
            onChange={(event) => controller.setQuery(event.target.value)}
            placeholder={translate("form.queryPlaceholder")}
            spellCheck={false}
            type="search"
            value={controller.query}
          />
          {controller.hasQueryText ? (
            <button
              aria-label={translate(
                controller.isSearching ? "form.submitLoading" : "form.search",
              )}
              className={cx(button({ size: "lg" }), actionButtonClass)}
              disabled={controller.isSearching}
              title={translate(
                controller.isSearching ? "form.submitLoading" : "form.search",
              )}
              type="submit"
            >
              <SearchIcon aria-hidden="true" className={iconClass} />
            </button>
          ) : null}
        </div>
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

const apiKeyFormClass = css({
  position: "fixed",
  top: "4",
  right: "4",
  left: "4",
  zIndex: "sticky",
  display: "grid",
  gap: "2",
  gridTemplateColumns: "minmax(0, 1fr) auto",
});

const sharedInputClass = css({
  minW: "0",
  w: "full",
  borderColor: "gray.7",
  bg: "gray.dark.3",
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

const searchInputRowClass = css({
  display: "grid",
  gap: "2",
  gridTemplateColumns: "minmax(0, 1fr) auto",
});

const actionButtonClass = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "10",
  px: "0",
});

const iconClass = css({
  w: "5",
  h: "5",
});

const statusClass = css({
  m: "0",
  color: "gray.11",
  textAlign: "center",
  textStyle: "sm",
});
