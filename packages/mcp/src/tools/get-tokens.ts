import { z } from "zod";
import { primitiveTokens, semanticTokens } from "../data/tokens";

// ============ INPUT SCHEMA ============

export const getTokensInputSchema = {
  category: z
    .enum(["all", "colors", "spacing", "typography", "radius"])
    .default("all")
    .describe("Token category to retrieve"),
  theme: z
    .enum(["light", "dark"])
    .default("light")
    .describe("Theme mode for semantic tokens"),
};

// ============ OUTPUT SCHEMA ============

export const getTokensOutputSchema = {
  category: z.string().describe("Requested token category"),
  theme: z.string().describe("Theme mode used"),
  primitives: z
    .record(z.any())
    .optional()
    .describe("Primitive token values (colors, spacing, typography, radius)"),
  semantic: z
    .record(z.any())
    .optional()
    .describe("Semantic token values for the selected theme"),
};

// ============ TYPES ============

export type GetTokensInput = {
  category: "all" | "colors" | "spacing" | "typography" | "radius";
  theme: "light" | "dark";
};

export type GetTokensOutput = {
  category: string;
  theme: string;
  primitives?: Record<string, unknown>;
  semantic?: Record<string, unknown>;
};

export function getTokens({ category, theme }: GetTokensInput): GetTokensOutput {
  const semantic = semanticTokens[theme];

  if (category === "all") {
    return {
      category,
      theme,
      primitives: primitiveTokens,
      semantic,
    };
  }

  if (category === "colors") {
    return {
      category,
      theme,
      primitives: primitiveTokens.color,
      semantic,
    };
  }

  if (category === "spacing") {
    return {
      category,
      theme,
      primitives: primitiveTokens.spacing,
    };
  }

  if (category === "typography") {
    return {
      category,
      theme,
      primitives: primitiveTokens.typography,
    };
  }

  if (category === "radius") {
    return {
      category,
      theme,
      primitives: primitiveTokens.radius,
    };
  }

  return { category, theme };
}
