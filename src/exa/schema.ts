import { z } from "zod";

export const exaSearchResultSchema = z.object({
  title: z.string().optional(),
  url: z.string().url(),
  highlights: z.array(z.string()).optional(),
});

export const exaSearchResponseSchema = z.object({
  requestId: z.string(),
  searchType: z.string().optional(),
  results: z.array(exaSearchResultSchema),
});

export type ExaSearchResult = z.infer<typeof exaSearchResultSchema>;

export interface ExaSearchViewResult {
  summary: string;
  title: string | null;
  url: string;
}

export interface SearchExaInput {
  apiKey: string;
  limit: number;
  query: string;
  requestNumber: number;
}

export interface SearchExaOutput {
  requestId: string;
  results: ExaSearchViewResult[];
  searchType: string | null;
}
