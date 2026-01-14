# MCP Tool Migration Plan: `server.tool()` → `server.registerTool()`

This document outlines the migration of 4 existing MCP tools from the legacy `server.tool()` API to the new `server.registerTool()` API with `outputSchema` support.

## Overview

### Why Migrate?

The `registerTool()` API provides:
- **Typed output schemas** - Clients can validate and parse structured responses
- **`structuredContent`** - Machine-readable JSON alongside human-readable text
- **Better discoverability** - `title` field for UI display
- **Consistency** - Aligns with newer tools (`compose_interface`, `get_layout_pattern`, `validate_accessibility`)

### Migration Order

```
1. get_tokens          (simplest, foundation for others)
2. get_component_spec  (depends on tokens conceptually)
3. get_code            (uses component specs)
4. search_components   (independent, migrate last)
```

### Pattern Comparison

**Before (legacy):**
```typescript
server.tool(
  "tool_name",
  "Description",
  inputSchema,
  async (params) => {
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);
```

**After (new):**
```typescript
server.registerTool(
  "tool_name",
  {
    title: "Tool Name",
    description: "Description",
    inputSchema: inputSchema,
    outputSchema: outputSchema,
  },
  async (params) => {
    return {
      content: [{ type: "text", text: "Human-readable summary" }],
      structuredContent: result,
    };
  }
);
```

---

## 1. `get_tokens`

### Current Implementation

**File:** `packages/mcp/src/tools/get-tokens.ts`

**Input Schema:**
```typescript
export const getTokensSchema = {
  category: z.enum(["all", "colors", "spacing", "typography", "radius"]).default("all"),
  theme: z.enum(["light", "dark"]).default("light"),
};
```

**Current Output:** Raw JSON stringified object

### Migration

#### Input Schema (unchanged)
```typescript
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
```

#### Output Schema (new)
```typescript
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
```

#### Type Definitions
```typescript
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
```

#### Updated Function Signature
```typescript
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
```

#### Server Registration
```typescript
server.registerTool(
  "get_tokens",
  {
    title: "Get Design Tokens",
    description:
      "Get design tokens by category (colors, spacing, typography, radius). Returns DTCG-format tokens with optional theme-specific semantic values.",
    inputSchema: getTokensInputSchema,
    outputSchema: getTokensOutputSchema,
  },
  async ({ category, theme }) => {
    const result = getTokens({ category, theme });

    const tokenCount = result.primitives
      ? Object.keys(result.primitives).length
      : 0;
    const summary = `Retrieved ${category} tokens (${tokenCount} primitives)${result.semantic ? ` with ${theme} semantic values` : ""}`;

    return {
      content: [{ type: "text", text: summary }],
      structuredContent: result,
    };
  }
);
```

---

## 2. `get_component_spec`

### Current Implementation

**File:** `packages/mcp/src/tools/get-component-spec.ts`

**Input Schema:**
```typescript
export const getComponentSpecSchema = {
  component: z.enum(["button", "input", "card", "select", "modal"]),
};
```

**Current Output:** Full spec object from `component-specs.json`

### Migration

#### Input Schema (unchanged)
```typescript
export const getComponentSpecInputSchema = {
  component: z
    .enum(["button", "input", "card", "select", "modal"])
    .describe("Component name to retrieve specification for"),
};
```

#### Output Schema (new)
```typescript
export const getComponentSpecOutputSchema = {
  name: z.string().describe("Component display name"),
  description: z.string().describe("Component description and purpose"),
  props: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        default: z.any().optional(),
        required: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .describe("Component props with types and defaults"),
  variants: z
    .record(z.array(z.string()))
    .optional()
    .describe("Available variant options (e.g., size, variant)"),
  slots: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        accepts: z.array(z.string()).optional(),
      })
    )
    .optional()
    .describe("Named slots for compound components"),
  tokens: z
    .array(z.string())
    .optional()
    .describe("Design tokens used by this component"),
  usage: z
    .object({
      when: z.array(z.string()).optional(),
      examples: z.array(z.string()).optional(),
    })
    .optional()
    .describe("Usage guidelines and examples"),
  dependencies: z
    .array(z.string())
    .optional()
    .describe("External dependencies (e.g., @base-ui-components/react)"),
};
```

#### Type Definitions
```typescript
export type PropDef = {
  name: string;
  type: string;
  default?: unknown;
  required?: boolean;
  description?: string;
};

export type SlotDef = {
  name: string;
  description: string;
  accepts?: string[];
};

export type GetComponentSpecInput = {
  component: "button" | "input" | "card" | "select" | "modal";
};

export type GetComponentSpecOutput = {
  name: string;
  description: string;
  props: PropDef[];
  variants?: Record<string, string[]>;
  slots?: SlotDef[];
  tokens?: string[];
  usage?: {
    when?: string[];
    examples?: string[];
  };
  dependencies?: string[];
};
```

#### Server Registration
```typescript
server.registerTool(
  "get_component_spec",
  {
    title: "Get Component Spec",
    description:
      "Get complete specification for a component including props, variants, slots, tokens, and usage guidelines.",
    inputSchema: getComponentSpecInputSchema,
    outputSchema: getComponentSpecOutputSchema,
  },
  async ({ component }) => {
    const spec = getComponentSpec({ component });

    if ("error" in spec) {
      return {
        content: [{ type: "text", text: spec.error }],
        isError: true,
      };
    }

    const propCount = spec.props?.length ?? 0;
    const variantCount = spec.variants ? Object.keys(spec.variants).length : 0;
    const summary = `${spec.name}: ${spec.description}\n\nProps: ${propCount} | Variants: ${variantCount} | Tokens: ${spec.tokens?.length ?? 0}`;

    return {
      content: [{ type: "text", text: summary }],
      structuredContent: spec,
    };
  }
);
```

---

## 3. `get_code`

### Current Implementation

**File:** `packages/mcp/src/tools/get-code.ts`

**Input Schema:**
```typescript
export const getCodeSchema = {
  component: z.enum(["button", "input", "card", "select", "modal"]),
  props: z.record(z.any()).optional(),
  children: z.string().optional(),
};
```

**Current Output:** JSX code string wrapped in markdown code fences

### Migration

#### Input Schema (enhanced)
```typescript
export const getCodeInputSchema = {
  component: z
    .enum(["button", "input", "card", "select", "modal"])
    .describe("Component to generate code for"),
  props: z
    .record(z.any())
    .optional()
    .describe("Props to apply to the component"),
  children: z
    .string()
    .optional()
    .describe("Children content or text"),
  framework: z
    .enum(["react", "react-server"])
    .default("react")
    .optional()
    .describe("Target framework (react for client components, react-server for RSC)"),
  variant: z
    .string()
    .optional()
    .describe("Specific variant to use (e.g., 'destructive', 'outline')"),
};
```

#### Output Schema (new)
```typescript
export const getCodeOutputSchema = {
  code: z.string().describe("Generated JSX/TSX code snippet"),
  component: z.string().describe("Component name used"),
  imports: z
    .array(z.string())
    .describe("Required import statements"),
  dependencies: z
    .array(z.string())
    .optional()
    .describe("npm packages required"),
  framework: z.string().describe("Target framework"),
  props: z
    .record(z.any())
    .optional()
    .describe("Props applied to the component"),
};
```

#### Type Definitions
```typescript
export type GetCodeInput = {
  component: "button" | "input" | "card" | "select" | "modal";
  props?: Record<string, unknown>;
  children?: string;
  framework?: "react" | "react-server";
  variant?: string;
};

export type GetCodeOutput = {
  code: string;
  component: string;
  imports: string[];
  dependencies?: string[];
  framework: string;
  props?: Record<string, unknown>;
};
```

#### Updated Function
```typescript
export function getCode({
  component,
  props = {},
  children,
  framework = "react",
  variant,
}: GetCodeInput): GetCodeOutput {
  // Apply variant to props if specified
  const finalProps = variant ? { ...props, variant } : props;

  const componentName = component.charAt(0).toUpperCase() + component.slice(1);

  // Generate code (existing logic)
  const code = generateComponentCode(component, componentName, finalProps, children);

  // Generate imports
  const imports = generateImports(component);

  // Determine dependencies
  const dependencies = getDependencies(component);

  return {
    code,
    component: componentName,
    imports,
    dependencies: dependencies.length > 0 ? dependencies : undefined,
    framework,
    props: Object.keys(finalProps).length > 0 ? finalProps : undefined,
  };
}

function generateImports(component: string): string[] {
  const importMap: Record<string, string[]> = {
    button: ['import { Button } from "@origen/react";'],
    input: ['import { Input } from "@origen/react";'],
    card: [
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@origen/react";',
    ],
    select: ['import { Select } from "@origen/react";'],
    modal: [
      'import { Modal } from "@origen/react";',
      'import { Button } from "@origen/react";',
    ],
  };
  return importMap[component] || [];
}

function getDependencies(component: string): string[] {
  const depMap: Record<string, string[]> = {
    select: ["@base-ui-components/react"],
    modal: ["@base-ui-components/react"],
  };
  return depMap[component] || [];
}
```

#### Server Registration
```typescript
server.registerTool(
  "get_code",
  {
    title: "Get Component Code",
    description:
      "Generate implementation code for a component with specified props, variant, and framework target.",
    inputSchema: getCodeInputSchema,
    outputSchema: getCodeOutputSchema,
  },
  async ({ component, props, children, framework, variant }) => {
    const result = getCode({ component, props, children, framework, variant });

    const summary = `Generated ${result.component} code for ${result.framework}`;
    const codeBlock = `\`\`\`tsx\n${result.imports.join("\n")}\n\n${result.code}\n\`\`\``;

    return {
      content: [{ type: "text", text: `${summary}\n\n${codeBlock}` }],
      structuredContent: result,
    };
  }
);
```

---

## 4. `search_components`

### Current Implementation

**File:** `packages/mcp/src/tools/search-components.ts`

**Input Schema:**
```typescript
export const searchComponentsSchema = {
  query: z.string(),
};
```

**Current Output:** Array of matching components

### Migration

#### Input Schema (enhanced)
```typescript
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
```

#### Output Schema (new)
```typescript
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
  count: z.number().describe("Total number of results"),
  hasMore: z.boolean().describe("Whether more results exist beyond limit"),
};
```

#### Type Definitions
```typescript
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
```

#### Updated Function
```typescript
export function searchComponents({
  query,
  limit = 10
}: SearchComponentsInput): SearchComponentsOutput {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  const scored = Object.entries(componentSpecs)
    .map(([name, spec]) => {
      const typedSpec = spec as ComponentSpec;
      const searchable = `${name} ${typedSpec.description} ${typedSpec.usage?.when?.join(" ") || ""}`.toLowerCase();

      // Calculate relevance score
      const matchedTerms = queryTerms.filter(term => searchable.includes(term));
      const score = matchedTerms.length / queryTerms.length;

      return {
        name,
        displayName: typedSpec.name,
        description: typedSpec.description,
        usage: typedSpec.usage?.when,
        score,
      };
    })
    .filter(result => result.score > 0)
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
```

#### Server Registration
```typescript
server.registerTool(
  "search_components",
  {
    title: "Search Components",
    description:
      "Search for components by description, use case, or keywords. Returns ranked results with relevance scores.",
    inputSchema: searchComponentsInputSchema,
    outputSchema: searchComponentsOutputSchema,
  },
  async ({ query, limit }) => {
    const result = searchComponents({ query, limit });

    if (result.count === 0) {
      return {
        content: [{ type: "text", text: `No components found for "${query}"` }],
        structuredContent: result,
      };
    }

    const summary = result.results
      .map(r => `- ${r.displayName} (${Math.round(r.score * 100)}%): ${r.description}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${result.count} component${result.count > 1 ? "s" : ""} for "${query}":\n\n${summary}`,
        },
      ],
      structuredContent: result,
    };
  }
);
```

---

## Migration Checklist

### Per-Tool Checklist

- [ ] **Rename schema export**: `xxxSchema` → `xxxInputSchema`
- [ ] **Add output schema**: `xxxOutputSchema` with Zod definitions
- [ ] **Add output type**: `XxxOutput` TypeScript type
- [ ] **Update function return type**: Return structured object, not raw data
- [ ] **Add helper functions**: For imports, dependencies, scoring, etc.
- [ ] **Update server registration**: Use `registerTool()` with title and schemas
- [ ] **Add structuredContent**: Return alongside human-readable content
- [ ] **Update exports**: Export both input and output schemas from tool file

### Server.ts Import Updates

```typescript
// Before
import { getTokens, getTokensSchema } from "./tools/get-tokens";

// After
import {
  getTokens,
  getTokensInputSchema,
  getTokensOutputSchema,
} from "./tools/get-tokens";
```

### Testing Checklist

- [ ] Tool returns valid `structuredContent` matching `outputSchema`
- [ ] Human-readable `content` provides useful summary
- [ ] Error cases still return `isError: true`
- [ ] Existing functionality unchanged
- [ ] TypeScript compilation succeeds
- [ ] MCP Inspector validates output schema

---

## File Changes Summary

| File | Changes |
|------|---------|
| `tools/get-tokens.ts` | Add outputSchema, update return type, export both schemas |
| `tools/get-component-spec.ts` | Add outputSchema, add slots/dependencies types |
| `tools/get-code.ts` | Add outputSchema, add imports/dependencies, framework option |
| `tools/search-components.ts` | Add outputSchema, add scoring, limit parameter |
| `server.ts` | Change all 4 tools from `tool()` to `registerTool()` |

---

## Rollback Plan

If issues arise, each tool can be individually reverted:

1. Change `registerTool()` back to `tool()`
2. Remove `outputSchema` from registration
3. Remove `structuredContent` from handler return
4. Revert import names (`xxxInputSchema` → `xxxSchema`)

The core logic remains unchanged, so rollback is low-risk.
