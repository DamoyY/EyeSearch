import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";
import { API_KEY_STORAGE_KEY } from "./config/search";
import { translate } from "./i18n/translate";

describe("App", () => {
  it("validates required search credentials before sending a request", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.type(
      screen.getByLabelText(translate("form.queryLabel")),
      "webgpu{Enter}",
    );

    expect(
      await screen.findByText(translate("status.apiKeyMissing")),
    ).toBeInTheDocument();
  });

  it("persists the API key in browser storage after saving", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.type(
      screen.getByLabelText(translate("form.apiKeyLabel")),
      "exa-key",
    );

    expect(window.localStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull();

    await user.click(
      screen.getByRole("button", { name: translate("form.saveApiKey") }),
    );

    expect(window.localStorage.getItem(API_KEY_STORAGE_KEY)).toBe("exa-key");
    expect(
      screen.queryByRole("button", { name: translate("form.saveApiKey") }),
    ).not.toBeInTheDocument();
  });

  it("shows a search button when the query input has text", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.queryByRole("button", { name: translate("form.search") }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(translate("form.queryLabel")), "web");

    await user.click(
      screen.getByRole("button", { name: translate("form.search") }),
    );

    expect(
      await screen.findByText(translate("status.apiKeyMissing")),
    ).toBeInTheDocument();
  });
});
