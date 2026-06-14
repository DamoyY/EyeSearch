import { describe, expect, it } from "vitest";

import type { ExaSearchViewResult } from "../exa/client";
import { dedupeResults } from "./results";

const results: ExaSearchViewResult[] = [
  {
    summary: ["alpha"],
    title: "Alpha",
    url: "https://www.example.com/report.html",
  },
  {
    summary: ["beta"],
    title: "Beta",
    url: "https://example.com/report",
  },
  {
    summary: ["gamma"],
    title: "Gamma",
    url: "https://example.org/report",
  },
];

describe("dedupeResults", () => {
  it("keeps the first visible URL and removes later duplicates", () => {
    const dedupedResults = dedupeResults(results, 7);

    expect(dedupedResults).toHaveLength(2);
    expect(dedupedResults.map((result) => result.url)).toEqual([
      "https://www.example.com/report.html",
      "https://example.org/report",
    ]);
  });
});
