# compose_interface Tool Implementation Plan

## Overview

A new MCP tool that interprets natural language intent and generates composed UI interfaces using Origen design system components. Uses the modern `registerTool()` API with `outputSchema` and `structuredContent`.

---

## 1. Input Schema

```typescript
export const composeInterfaceInputSchema = {
  intent: z
    .string()
    .describe("Natural language description of the interface to create (e.g., 'login form', 'user profile card')"),
  context: z
    .enum(["page", "section", "component"])
    .default("section")
    .describe("Scope of the interface: full page, section within a page, or single component"),
};

export type ComposeInterfaceInput = {
  intent: string;
  context: "page" | "section" | "component";
};
```

### Parameter Details

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `intent` | string | required | Natural language describing desired UI |
| `context` | enum | "section" | Determines layout wrapper and complexity |

### Context Behavior

- **page**: Wraps in full page layout, may include header/footer
- **section**: Wraps in semantic section, moderate complexity
- **component**: Returns single composite component, minimal wrapper

---

## 2. Output Schema

```typescript
export const composeInterfaceOutputSchema = {
  layout: z.object({
    type: z.enum(["flex", "grid", "stack"]),
    direction: z.enum(["row", "column"]).optional(),
    gap: z.string().optional(),
  }),
  components: z.array(
    z.object({
      name: z.enum(["Button", "Input", "Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter", "Select", "Modal"]),
      props: z.record(z.any()),
      slot: z.enum(["header", "content", "footer", "trigger"]).optional(),
      children: z.string().optional(),
    })
  ),
  code: z.string().describe("Generated JSX code snippet"),
  tokens: z.array(z.string()).describe("Design tokens referenced"),
};

export type ComposeInterfaceOutput = {
  layout: {
    type: "flex" | "grid" | "stack";
    direction?: "row" | "column";
    gap?: string;
  };
  components: Array<{
    name: string;
    props: Record<string, unknown>;
    slot?: "header" | "content" | "footer" | "trigger";
    children?: string;
  }>;
  code: string;
  tokens: string[];
};
```

### Output Fields

| Field | Description |
|-------|-------------|
| `layout` | Container layout configuration |
| `components` | Ordered list of components with their props |
| `code` | Ready-to-use JSX snippet |
| `tokens` | Array of semantic token names used (e.g., `["primary", "background", "border"]`) |

---

## 3. Intent Mapping

### Keyword Detection Strategy

Parse intent string for keywords and map to component compositions.

```typescript
type IntentPattern = {
  keywords: string[];
  components: ComponentDefinition[];
  layout: LayoutConfig;
};

const intentPatterns: IntentPattern[] = [
  // Authentication patterns
  {
    keywords: ["login", "signin", "sign in", "log in"],
    components: [
      { name: "Card", slot: "wrapper" },
      { name: "CardHeader", slot: "header" },
      { name: "CardTitle", children: "Sign In" },
      { name: "CardContent", slot: "content" },
      { name: "Input", props: { type: "email", placeholder: "Email" } },
      { name: "Input", props: { type: "password", placeholder: "Password" } },
      { name: "CardFooter", slot: "footer" },
      { name: "Button", props: { variant: "default" }, children: "Sign In" },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // User profile patterns
  {
    keywords: ["profile", "user card", "user profile", "account"],
    components: [
      { name: "Card", slot: "wrapper" },
      { name: "CardHeader", slot: "header" },
      { name: "CardTitle", children: "User Profile" },
      { name: "CardDescription", children: "Manage your account" },
      { name: "CardContent", slot: "content" },
      // Avatar placeholder (text-based for now)
      { name: "Button", props: { variant: "secondary" }, children: "Edit Profile" },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // Form patterns
  {
    keywords: ["form", "input form", "data entry"],
    components: [
      { name: "Card", slot: "wrapper" },
      { name: "CardHeader", slot: "header" },
      { name: "CardTitle", children: "Form" },
      { name: "CardContent", slot: "content" },
      // Dynamic inputs based on fields mentioned in intent
      { name: "CardFooter", slot: "footer" },
      { name: "Button", props: { variant: "default" }, children: "Submit" },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // Navigation patterns
  {
    keywords: ["navigation", "header", "navbar", "nav"],
    components: [
      { name: "Button", props: { variant: "ghost" }, children: "Home" },
      { name: "Button", props: { variant: "ghost" }, children: "About" },
      { name: "Button", props: { variant: "ghost" }, children: "Contact" },
    ],
    layout: { type: "flex", direction: "row", gap: "2" },
  },

  // Settings patterns
  {
    keywords: ["settings", "preferences", "options"],
    components: [
      { name: "Card", slot: "wrapper" },
      { name: "CardHeader", slot: "header" },
      { name: "CardTitle", children: "Settings" },
      { name: "CardContent", slot: "content" },
      { name: "Select", props: { placeholder: "Choose option" } },
      { name: "CardFooter", slot: "footer" },
      { name: "Button", props: { variant: "default" }, children: "Save" },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // Modal/dialog patterns
  {
    keywords: ["modal", "dialog", "popup", "confirm"],
    components: [
      { name: "Modal", slot: "wrapper" },
      { name: "Button", slot: "trigger", children: "Open" },
      // Modal.Content handled specially
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },
];
```

### Dynamic Field Detection

For form intents, parse additional fields from the intent string:

```typescript
function extractFormFields(intent: string): string[] {
  const fieldPatterns = [
    { pattern: /email/i, field: "email" },
    { pattern: /password/i, field: "password" },
    { pattern: /name/i, field: "text" },
    { pattern: /phone/i, field: "tel" },
    { pattern: /message|comment/i, field: "textarea" },
    { pattern: /date/i, field: "date" },
  ];

  return fieldPatterns
    .filter(({ pattern }) => pattern.test(intent))
    .map(({ field }) => field);
}
```

### Matching Algorithm

```typescript
function matchIntent(intent: string): IntentPattern | null {
  const normalized = intent.toLowerCase();

  // Score each pattern by keyword matches
  const scored = intentPatterns.map(pattern => ({
    pattern,
    score: pattern.keywords.filter(kw => normalized.includes(kw)).length,
  }));

  // Return highest scoring pattern with score > 0
  const best = scored.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.pattern : null;
}
```

---

## 4. Code Generation

### Assembly Strategy

1. **Determine wrapper** based on context (page/section/component)
2. **Build component tree** from matched pattern
3. **Generate JSX** with proper nesting and indentation
4. **Collect tokens** used by components

### Code Generator

```typescript
function generateCode(
  layout: LayoutConfig,
  components: ComponentDefinition[],
  context: "page" | "section" | "component"
): string {
  const indent = "  ";

  // Group components by slot for proper nesting
  const slotted = groupBySlot(components);

  // Build the component tree
  let code = "";

  if (context === "page") {
    code += `<div className="min-h-screen bg-background p-8">\n`;
  }

  // Handle Card-based layouts
  if (slotted.wrapper?.some(c => c.name === "Card")) {
    code += generateCardStructure(slotted, indent);
  } else {
    // Flat layout (e.g., navigation)
    code += generateFlatLayout(components, layout, indent);
  }

  if (context === "page") {
    code += `</div>`;
  }

  return code;
}

function generateCardStructure(
  slotted: SlottedComponents,
  indent: string
): string {
  let code = `<Card>\n`;

  if (slotted.header) {
    code += `${indent}<CardHeader>\n`;
    for (const comp of slotted.header) {
      code += `${indent}${indent}${renderComponent(comp)}\n`;
    }
    code += `${indent}</CardHeader>\n`;
  }

  if (slotted.content) {
    code += `${indent}<CardContent className="flex flex-col gap-4">\n`;
    for (const comp of slotted.content) {
      code += `${indent}${indent}${renderComponent(comp)}\n`;
    }
    code += `${indent}</CardContent>\n`;
  }

  if (slotted.footer) {
    code += `${indent}<CardFooter>\n`;
    for (const comp of slotted.footer) {
      code += `${indent}${indent}${renderComponent(comp)}\n`;
    }
    code += `${indent}</CardFooter>\n`;
  }

  code += `</Card>`;
  return code;
}

function renderComponent(comp: ComponentDefinition): string {
  const propsStr = Object.entries(comp.props || {})
    .map(([k, v]) => {
      if (typeof v === "string") return `${k}="${v}"`;
      if (typeof v === "boolean") return v ? k : `${k}={false}`;
      return `${k}={${JSON.stringify(v)}}`;
    })
    .join(" ");

  if (comp.children) {
    return `<${comp.name}${propsStr ? ` ${propsStr}` : ""}>${comp.children}</${comp.name}>`;
  }
  return `<${comp.name}${propsStr ? ` ${propsStr}` : ""} />`;
}
```

### Token Collection

```typescript
function collectTokens(components: ComponentDefinition[]): string[] {
  const tokenMap: Record<string, string[]> = {
    Button: ["primary", "primary-foreground", "secondary", "destructive"],
    Input: ["background", "border", "input", "ring", "foreground"],
    Card: ["card", "card-foreground", "border"],
    Select: ["background", "border", "foreground"],
    Modal: ["background", "foreground", "border"],
  };

  const tokens = new Set<string>();
  for (const comp of components) {
    const compTokens = tokenMap[comp.name] || [];
    compTokens.forEach(t => tokens.add(t));
  }

  return Array.from(tokens).sort();
}
```

---

## 5. Test Cases

### Unit Test Matrix

| Intent | Context | Expected Layout | Expected Components | Notes |
|--------|---------|-----------------|---------------------|-------|
| `"login form"` | section | stack/column | Card, 2 Inputs, Button | Email + password inputs |
| `"sign in page"` | page | stack/column | Card, 2 Inputs, Button | Wrapped in page container |
| `"user profile card"` | component | stack/column | Card, CardHeader, CardContent, Button | Minimal wrapper |
| `"contact form with name email message"` | section | stack/column | Card, 3 Inputs, Button | Dynamic field detection |
| `"navigation header"` | section | flex/row | 3 Buttons (ghost) | Horizontal layout |
| `"settings page"` | page | stack/column | Card, Select, Button | Full page wrapper |
| `"confirm dialog"` | component | stack/column | Modal, Button (trigger) | Modal pattern |
| `"unknown widget thing"` | section | — | — | Error with suggestions |
| `""` (empty) | section | — | — | Validation error |

### Test File Structure

```typescript
// compose-interface.test.ts
import { describe, it, expect } from "vitest";
import { composeInterface, matchIntent, generateCode } from "./compose-interface";

describe("composeInterface", () => {
  describe("intent matching", () => {
    it("matches login keywords", () => {
      const result = matchIntent("login form");
      expect(result).toBeDefined();
      expect(result?.keywords).toContain("login");
    });

    it("matches signin variations", () => {
      expect(matchIntent("sign in page")).toBeDefined();
      expect(matchIntent("signin form")).toBeDefined();
    });

    it("returns null for unknown intents", () => {
      expect(matchIntent("quantum flux capacitor")).toBeNull();
    });
  });

  describe("code generation", () => {
    it("generates valid Card structure for login", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      expect(result.code).toContain("<Card>");
      expect(result.code).toContain('<Input type="email"');
      expect(result.code).toContain('<Input type="password"');
      expect(result.code).toContain("<Button");
    });

    it("wraps in page container for page context", () => {
      const result = composeInterface({ intent: "login", context: "page" });
      expect(result.code).toContain("min-h-screen");
      expect(result.code).toContain("bg-background");
    });

    it("uses flex layout for navigation", () => {
      const result = composeInterface({ intent: "navigation header", context: "section" });
      expect(result.layout.type).toBe("flex");
      expect(result.layout.direction).toBe("row");
    });
  });

  describe("token collection", () => {
    it("collects tokens used by components", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      expect(result.tokens).toContain("primary");
      expect(result.tokens).toContain("card");
      expect(result.tokens).toContain("input");
    });
  });

  describe("dynamic field detection", () => {
    it("adds email input when email mentioned", () => {
      const result = composeInterface({ intent: "form with email", context: "section" });
      expect(result.components.some(c => c.props?.type === "email")).toBe(true);
    });

    it("adds multiple inputs for multiple fields", () => {
      const result = composeInterface({
        intent: "contact form with name email phone",
        context: "section"
      });
      const inputs = result.components.filter(c => c.name === "Input");
      expect(inputs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("error handling", () => {
    it("returns error for empty intent", () => {
      const result = composeInterface({ intent: "", context: "section" });
      expect(result).toHaveProperty("error");
    });

    it("returns suggestions for unknown intent", () => {
      const result = composeInterface({ intent: "xyz123", context: "section" });
      expect(result).toHaveProperty("suggestions");
    });
  });
});
```

---

## 6. File Structure

```
packages/mcp/src/tools/
├── compose-interface.ts       # Main implementation
├── compose-interface.test.ts  # Unit tests
├── get-tokens.ts              # Existing (unchanged)
├── get-component-spec.ts      # Existing (unchanged)
├── get-code.ts                # Existing (unchanged)
└── search-components.ts       # Existing (unchanged)
```

### compose-interface.ts Structure

```typescript
// packages/mcp/src/tools/compose-interface.ts

import { z } from "zod";

// ============ SCHEMAS ============

export const composeInterfaceInputSchema = {
  intent: z.string().describe("Natural language description of the interface"),
  context: z.enum(["page", "section", "component"]).default("section"),
};

export const composeInterfaceOutputSchema = {
  layout: z.object({
    type: z.enum(["flex", "grid", "stack"]),
    direction: z.enum(["row", "column"]).optional(),
    gap: z.string().optional(),
  }),
  components: z.array(z.object({
    name: z.string(),
    props: z.record(z.any()),
    slot: z.enum(["header", "content", "footer", "trigger", "wrapper"]).optional(),
    children: z.string().optional(),
  })),
  code: z.string(),
  tokens: z.array(z.string()),
};

// ============ TYPES ============

export type ComposeInterfaceInput = z.infer<z.ZodObject<typeof composeInterfaceInputSchema>>;
export type ComposeInterfaceOutput = z.infer<z.ZodObject<typeof composeInterfaceOutputSchema>>;

// ============ INTENT PATTERNS ============

const intentPatterns = [ /* ... patterns from section 3 ... */ ];

// ============ HELPERS ============

function matchIntent(intent: string): IntentPattern | null { /* ... */ }
function extractFormFields(intent: string): string[] { /* ... */ }
function generateCode(layout, components, context): string { /* ... */ }
function collectTokens(components): string[] { /* ... */ }

// ============ MAIN FUNCTION ============

export function composeInterface(input: ComposeInterfaceInput): ComposeInterfaceOutput {
  const { intent, context } = input;

  // Validate intent
  if (!intent.trim()) {
    throw new Error("Intent cannot be empty");
  }

  // Match intent to pattern
  const pattern = matchIntent(intent);
  if (!pattern) {
    return {
      layout: { type: "stack", direction: "column" },
      components: [],
      code: "// No matching pattern found",
      tokens: [],
      suggestions: ["login form", "user profile", "contact form", "navigation"],
    } as any; // Handle error case
  }

  // Generate output
  const components = buildComponentList(pattern, intent);
  const code = generateCode(pattern.layout, components, context);
  const tokens = collectTokens(components);

  return {
    layout: pattern.layout,
    components,
    code,
    tokens,
  };
}
```

### Server Registration

```typescript
// In server.ts - add after existing tools

import {
  composeInterface,
  composeInterfaceInputSchema,
  composeInterfaceOutputSchema,
} from "./tools/compose-interface";

server.registerTool(
  "compose_interface",
  {
    title: "Compose Interface",
    description: "Generate a composed UI interface from natural language intent. Returns layout configuration, component list, JSX code, and tokens used.",
    inputSchema: composeInterfaceInputSchema,
    outputSchema: composeInterfaceOutputSchema,
  },
  async ({ intent, context }) => {
    const output = composeInterface({ intent, context });
    return {
      content: [
        {
          type: "text",
          text: `Generated ${context} for "${intent}":\n\n\`\`\`tsx\n${output.code}\n\`\`\`\n\nComponents: ${output.components.map(c => c.name).join(", ")}\nTokens: ${output.tokens.join(", ")}`,
        },
      ],
      structuredContent: output,
    };
  }
);
```

---

## Implementation Checklist

- [ ] Create `compose-interface.ts` with schemas and types
- [ ] Implement intent pattern definitions
- [ ] Implement `matchIntent()` function
- [ ] Implement `extractFormFields()` for dynamic forms
- [ ] Implement `generateCode()` function
- [ ] Implement `collectTokens()` function
- [ ] Implement main `composeInterface()` function
- [ ] Add error handling for unknown intents
- [ ] Register tool in `server.ts` using `registerTool()`
- [ ] Create `compose-interface.test.ts`
- [ ] Write unit tests for intent matching
- [ ] Write unit tests for code generation
- [ ] Write unit tests for error cases
- [ ] Update exports in `index.ts`
- [ ] Test end-to-end via MCP client
