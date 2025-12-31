/**
 * Test script for @origen/mcp tools
 * Run with: npx tsx scripts/test-mcp.ts
 */

import {
  getTokens,
  getComponentSpec,
  getCode,
  searchComponents,
} from "../packages/mcp/src/index.js";

console.log("=".repeat(60));
console.log("Testing @origen/mcp Tools");
console.log("=".repeat(60));

// Test 1: get_tokens
console.log("\n1. Testing get_tokens (colors, light theme):");
console.log("-".repeat(40));
const colorTokens = getTokens({ category: "colors", theme: "light" });
console.log(
  "Primitive colors:",
  Object.keys(colorTokens.primitives || {}).slice(0, 5)
);
console.log(
  "Semantic tokens:",
  Object.keys(colorTokens.semantic || {}).slice(0, 5)
);

console.log("\n2. Testing get_tokens (spacing):");
console.log("-".repeat(40));
const spacingTokens = getTokens({ category: "spacing", theme: "light" });
console.log(
  "Spacing:",
  Object.keys(spacingTokens.primitives || {}).slice(0, 5)
);

// Test 2: get_component_spec
console.log("\n3. Testing get_component_spec (button):");
console.log("-".repeat(40));
const buttonSpec = getComponentSpec({ component: "button" }) as any;
if ("error" in buttonSpec) {
  console.log("Error:", buttonSpec.error);
} else {
  console.log("Name:", buttonSpec.name);
  console.log("Description:", buttonSpec.description?.slice(0, 50) + "...");
  console.log("Props:", Object.keys(buttonSpec.props || {}));
  console.log("Tokens:", Object.keys(buttonSpec.tokens || {}));
}

console.log("\n4. Testing get_component_spec (select):");
console.log("-".repeat(40));
const selectSpec = getComponentSpec({ component: "select" }) as any;
if ("error" in selectSpec) {
  console.log("Error:", selectSpec.error);
} else {
  console.log("Name:", selectSpec.name);
  console.log("Description:", selectSpec.description?.slice(0, 50) + "...");
  console.log("Base UI:", selectSpec.baseUI);
}

// Test 3: get_code
console.log("\n5. Testing get_code (Button with props):");
console.log("-".repeat(40));
const buttonCode = getCode({
  component: "Button",
  props: { variant: "destructive", size: "lg" },
  children: "Delete",
});
console.log(buttonCode);

console.log("\n6. Testing get_code (Card):");
console.log("-".repeat(40));
const cardCode = getCode({
  component: "Card",
  children: "Card Content",
});
console.log(cardCode);

// Test 4: search_components
console.log("\n7. Testing search_components (query: 'form'):");
console.log("-".repeat(40));
const formResults = searchComponents({ query: "form" });
console.log(
  "Results:",
  formResults.map((r) => r.name)
);

console.log("\n8. Testing search_components (query: 'dialog'):");
console.log("-".repeat(40));
const dialogResults = searchComponents({ query: "dialog" });
console.log(
  "Results:",
  dialogResults.map((r) => r.name)
);

// Test error handling
console.log("\n9. Testing error handling (invalid component):");
console.log("-".repeat(40));
const invalidSpec = getComponentSpec({ component: "NonExistent" as any });
console.log("Result:", invalidSpec);

console.log("\n" + "=".repeat(60));
console.log("All tests completed!");
console.log("=".repeat(60));
