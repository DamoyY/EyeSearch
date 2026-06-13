import { StrictMode, type ReactElement } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { translate } from "./i18n/translate";
import "./i18n/initialize";
import "./panda.css";

function readRootElement(): HTMLElement {
  const rootElement = document.getElementById("root");

  if (rootElement === null) {
    throw new Error(translate("errors.rootMissing"));
  }

  return rootElement;
}

function renderApplication(): ReactElement {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

export function mountApplication(): void {
  createRoot(readRootElement()).render(renderApplication());
}

mountApplication();
