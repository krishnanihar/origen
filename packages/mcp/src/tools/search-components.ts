import { z } from "zod";
import componentSpecs from "../data/component-specs.json";

export const searchComponentsSchema = {
  query: z
    .string()
    .describe("Search query (e.g., 'form input', 'action button')"),
};

export type SearchComponentsInput = {
  query: string;
};

type ComponentSpec = {
  name: string;
  description: string;
  usage?: {
    when?: string[];
  };
};

export function searchComponents({ query }: SearchComponentsInput) {
  const queryLower = query.toLowerCase();

  const results = Object.entries(componentSpecs)
    .filter(([name, spec]) => {
      const typedSpec = spec as ComponentSpec;
      const searchable = `${name} ${typedSpec.description} ${typedSpec.usage?.when?.join(" ") || ""}`.toLowerCase();
      return searchable.includes(queryLower);
    })
    .map(([name, spec]) => {
      const typedSpec = spec as ComponentSpec;
      return {
        name,
        displayName: typedSpec.name,
        description: typedSpec.description,
        usage: typedSpec.usage?.when,
      };
    });

  return results;
}
