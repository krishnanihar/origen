import StyleDictionary from "style-dictionary";
import { register } from "@tokens-studio/sd-transforms";

// Register Tokens Studio transforms for DTCG format
register(StyleDictionary);

// Custom transform for kebab-case CSS variable names
StyleDictionary.registerTransform({
  name: "name/kebab",
  type: "name",
  transform: (token) => {
    // Convert path to kebab-case: color.slate.50 -> color-slate-50
    return token.path.join("-");
  },
});

// Build config for light theme
const config = {
  source: ["src/primitives/**/*.tokens.json", "src/semantic/light.tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab"],
      buildPath: "build/css/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
            selector: ":root",
          },
        },
      ],
    },
    js: {
      // Use default tokens-studio transform group (camelCase) for JS
      transformGroup: "tokens-studio",
      buildPath: "build/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
        {
          destination: "tokens.d.ts",
          format: "typescript/es6-declarations",
        },
      ],
    },
  },
};

// Dark theme config
const darkConfig = {
  source: ["src/primitives/**/*.tokens.json", "src/semantic/dark.tokens.json"],
  preprocessors: ["tokens-studio"],
  platforms: {
    css: {
      transformGroup: "tokens-studio",
      transforms: ["name/kebab"],
      buildPath: "build/css/",
      files: [
        {
          destination: "tokens-dark.css",
          format: "css/variables",
          options: {
            outputReferences: true,
            selector: ".dark",
          },
          // Only include semantic tokens in dark override
          filter: (token) => token.filePath.includes("semantic"),
        },
      ],
    },
  },
};

// Build light theme
console.log("Building light theme...");
const sdLight = new StyleDictionary(config);
await sdLight.buildAllPlatforms();

// Build dark theme
console.log("Building dark theme...");
const sdDark = new StyleDictionary(darkConfig);
await sdDark.buildAllPlatforms();

console.log("\n✓ Tokens built successfully!");
