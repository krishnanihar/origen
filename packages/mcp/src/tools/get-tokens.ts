import { z } from "zod";
import { primitiveTokens, semanticTokens } from "../data/tokens";

export const getTokensSchema = {
  category: z
    .enum(["all", "colors", "spacing", "typography", "radius"])
    .default("all")
    .describe("Token category to retrieve"),
  theme: z
    .enum(["light", "dark"])
    .default("light")
    .describe("Theme mode for semantic tokens"),
};

export type GetTokensInput = {
  category: "all" | "colors" | "spacing" | "typography" | "radius";
  theme: "light" | "dark";
};

export function getTokens({ category, theme }: GetTokensInput) {
  const semantic = semanticTokens[theme];

  if (category === "all") {
    return {
      primitives: primitiveTokens,
      semantic,
    };
  }

  if (category === "colors") {
    return {
      primitives: primitiveTokens.color,
      semantic,
    };
  }

  if (category === "spacing") {
    return {
      primitives: primitiveTokens.spacing,
    };
  }

  if (category === "typography") {
    return {
      primitives: primitiveTokens.typography,
    };
  }

  if (category === "radius") {
    return {
      primitives: primitiveTokens.radius,
    };
  }

  return {};
}
