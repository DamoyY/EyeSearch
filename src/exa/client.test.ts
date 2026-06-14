import { describe, expect, it, vi } from "vitest";

import { EXA_SEARCH_ENDPOINT } from "../config/search";
import { translate } from "../i18n/translate";
import { searchExa } from "./client";

function installFetchMock(response: Response): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function readFirstFetchBody(
  fetchMock: ReturnType<typeof vi.fn>,
): Record<string, unknown> {
  const call = fetchMock.mock.calls.at(0);

  if (call === undefined) {
    throw new Error("E_TEST_FETCH_CALL_MISSING");
  }

  const init = call[1] as RequestInit | undefined;

  if (init === undefined || typeof init.body !== "string") {
    throw new Error("E_TEST_FETCH_BODY_MISSING");
  }

  return JSON.parse(init.body) as Record<string, unknown>;
}

describe("searchExa", () => {
  it("sends a structured Exa request and maps highlights", async () => {
    const fetchMock = installFetchMock(
      new Response(
        JSON.stringify({
          requestId: "req-1",
          searchType: "auto",
          results: [
            {
              title: "Alpha",
              url: "https://example.com/a",
              highlights: ["  first line\n\nsecond line  ", " \nthird line\n "],
            },
          ],
        }),
        { status: 200, statusText: "OK" },
      ),
    );

    const output = await searchExa({
      apiKey: "key",
      limit: 3,
      query: "alpha",
      requestNumber: 1,
    });
    const payload = readFirstFetchBody(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      EXA_SEARCH_ENDPOINT,
      expect.objectContaining({ method: "POST" }),
    );
    expect(payload).toMatchObject({
      numResults: 3,
      query: "alpha",
      type: "auto",
    });
    expect(output.results).toEqual([
      {
        summary: "first line\nsecond line\nthird line",
        title: "Alpha",
        url: "https://example.com/a",
      },
    ]);
  });

  it("raises localized HTTP errors from Exa responses", async () => {
    installFetchMock(
      new Response(JSON.stringify({ error: { message: "quota" } }), {
        status: 429,
        statusText: "Too Many Requests",
      }),
    );

    await expect(
      searchExa({ apiKey: "key", limit: 1, query: "alpha", requestNumber: 2 }),
    ).rejects.toThrow(
      translate("errors.exaHttpWithMessage", {
        message: "quota",
        status: 429,
        statusText: "Too Many Requests",
      }),
    );
  });
});
