import { z } from "zod";
import componentSpecs from "../data/component-specs.json";

// ============ INPUT SCHEMA ============

export const searchComponentsInputSchema = {
  query: z
    .string()
    .describe("Search query (e.g., 'form input', 'action button', 'dialog')"),
  limit: z
    .number()
    .min(1)
    .max(20)
    .default(10)
    .optional()
    .describe("Maximum number of results to return"),
};

// ============ OUTPUT SCHEMA ============

export const searchComponentsOutputSchema = {
  query: z.string().describe("Original search query"),
  results: z
    .array(
      z.object({
        name: z.string().describe("Component identifier"),
        displayName: z.string().describe("Component display name"),
        description: z.string().describe("Component description"),
        usage: z.array(z.string()).optional().describe("When to use this component"),
        score: z.number().min(0).max(1).describe("Relevance score (0-1)"),
      })
    )
    .describe("Matching components sorted by relevance"),
  count: z.number().describe("Number of results returned"),
  hasMore: z.boolean().describe("Whether more results exist beyond limit"),
};

// ============ TYPES ============

export type SearchComponentsInput = {
  query: string;
  limit?: number;
};

export type SearchResult = {
  name: string;
  displayName: string;
  description: string;
  usage?: string[];
  score: number;
};

export type SearchComponentsOutput = {
  query: string;
  results: SearchResult[];
  count: number;
  hasMore: boolean;
};

type ComponentSpec = {
  name: string;
  description: string;
  usage?: {
    when?: string[];
  };
};

export function searchComponents({
  query,
  limit = 10,
}: SearchComponentsInput): SearchComponentsOutput {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 0);

  const scored = Object.entries(componentSpecs)
    .map(([name, spec]) => {
      const typedSpec = spec as ComponentSpec;
      const searchable = `${name} ${typedSpec.description} ${typedSpec.usage?.when?.join(" ") || ""}`.toLowerCase();

      // Calculate relevance score based on term matches
      const matchedTerms = queryTerms.filter((term) => searchable.includes(term));
      const score = queryTerms.length > 0 ? matchedTerms.length / queryTerms.length : 0;

      return {
        name,
        displayName: typedSpec.name,
        description: typedSpec.description,
        usage: typedSpec.usage?.when,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);

  const totalCount = scored.length;
  const results = scored.slice(0, limit);

  return {
    query,
    results,
    count: results.length,
    hasMore: totalCount > limit,
  };
}
