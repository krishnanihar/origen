import { allTokens, primitiveTokens, semanticTokens } from "../data/tokens";

export function getAllTokens() {
  return {
    uri: "tokens://all",
    mimeType: "application/json",
    text: JSON.stringify(allTokens, null, 2),
  };
}

export function getColorTokens() {
  return {
    uri: "tokens://colors",
    mimeType: "application/json",
    text: JSON.stringify(
      {
        primitives: primitiveTokens.color,
        semantic: {
          light: Object.fromEntries(
            Object.entries(semanticTokens.light).filter(([key]) =>
              key.includes("color") ||
              key === "background" ||
              key === "foreground" ||
              key.includes("-foreground")
            )
          ),
          dark: Object.fromEntries(
            Object.entries(semanticTokens.dark).filter(([key]) =>
              key.includes("color") ||
              key === "background" ||
              key === "foreground" ||
              key.includes("-foreground")
            )
          ),
        },
      },
      null,
      2
    ),
  };
}

export function getSpacingTokens() {
  return {
    uri: "tokens://spacing",
    mimeType: "application/json",
    text: JSON.stringify(primitiveTokens.spacing, null, 2),
  };
}

export function getTypographyTokens() {
  return {
    uri: "tokens://typography",
    mimeType: "application/json",
    text: JSON.stringify(primitiveTokens.typography, null, 2),
  };
}

export function getRadiusTokens() {
  return {
    uri: "tokens://radius",
    mimeType: "application/json",
    text: JSON.stringify(primitiveTokens.radius, null, 2),
  };
}

export const tokenResources = [
  {
    uri: "tokens://all",
    name: "All Tokens",
    description: "Complete design token palette in DTCG format",
    mimeType: "application/json",
  },
  {
    uri: "tokens://colors",
    name: "Color Tokens",
    description: "Color primitives and semantic color tokens",
    mimeType: "application/json",
  },
  {
    uri: "tokens://spacing",
    name: "Spacing Tokens",
    description: "Spacing scale tokens",
    mimeType: "application/json",
  },
  {
    uri: "tokens://typography",
    name: "Typography Tokens",
    description: "Font family, size, weight, and line height tokens",
    mimeType: "application/json",
  },
  {
    uri: "tokens://radius",
    name: "Radius Tokens",
    description: "Border radius tokens",
    mimeType: "application/json",
  },
];

export function getTokenResource(uri: string) {
  switch (uri) {
    case "tokens://all":
      return getAllTokens();
    case "tokens://colors":
      return getColorTokens();
    case "tokens://spacing":
      return getSpacingTokens();
    case "tokens://typography":
      return getTypographyTokens();
    case "tokens://radius":
      return getRadiusTokens();
    default:
      return null;
  }
}
