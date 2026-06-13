import { describe, expect, it } from "vitest";

import { createResultKey, formatDisplayUrl } from "./displayUrl";

describe("formatDisplayUrl", () => {
  it("removes common visual noise from a result URL", () => {
    const displayUrl = formatDisplayUrl(
      "https://www.example.com/path/index.html?x=1#top",
    );

    expect(displayUrl).toBe("example.com/path/index?x=1#top");
  });

  it("normalizes result keys with a stable locale", () => {
    const resultKey = createResultKey("https://WWW.Example.com/Guide.HTML");

    expect(resultKey).toBe("example.com/guide");
  });
});
