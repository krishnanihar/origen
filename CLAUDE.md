# Origen - Claude Code Context

## Project Overview

Origen is an **MCP-native design system** — the first design system built for the AI era. It exposes components, tokens, and specifications through the Model Context Protocol (MCP), allowing AI agents to query design decisions, generate implementation code, and maintain design-code consistency.

**Creator**: Knih ([@knih](https://github.com/knih))

---

## Monorepo Structure

```
origen/
├── apps/
│   └── docs/                    # Storybook docs (future)
├── packages/
│   ├── tokens/                  # Design tokens (W3C DTCG format)
│   │   ├── src/
│   │   │   ├── primitives/      # colors, spacing, typography tokens
│   │   │   ├── semantic/        # light.tokens.json, dark.tokens.json
│   │   │   └── index.tokens.json
│   │   ├── build/               # Style Dictionary output (css/, tokens.js)
│   │   └── config.js            # Style Dictionary config
│   ├── react/                   # React component library
│   │   ├── src/
│   │   │   ├── components/      # button/, input/, card/, select/, modal/
│   │   │   ├── styles/          # globals.css
│   │   │   └── index.ts
│   │   └── tsup.config.ts
│   └── mcp/                     # MCP server (Vercel deployment)
│       ├── src/
│       │   ├── server.ts
│       │   ├── tools/           # get-tokens, get-component-spec, get-code
│       │   ├── resources/       # tokens, components
│       │   └── data/            # component-specs.json
│       ├── app/api/mcp/route.ts # Vercel route handler
│       └── vercel.json
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Tech Stack

### Core Dependencies

| Package | Purpose |
|---------|---------|
| `pnpm` | Package manager (v9+) |
| `turbo` | Monorepo build orchestration (v2+) |
| `typescript` | Type safety (v5.4+) |

### @origen/tokens

| Dependency | Purpose |
|------------|---------|
| `style-dictionary` | Token build pipeline |
| `@tokens-studio/sd-transforms` | DTCG preprocessor |

### @origen/react

| Dependency | Purpose |
|------------|---------|
| `@base-ui-components/react` | Unstyled primitives for Select, Modal |
| `class-variance-authority` | Variant-based styling (cva) |
| `tailwind-merge` | Merging Tailwind classes |
| `tailwindcss` | Utility-first CSS (v4) |
| `tsup` | Build/bundle (ESM + CJS) |

### @origen/mcp

| Dependency | Purpose |
|------------|---------|
| `@modelcontextprotocol/sdk` | MCP server implementation |
| `zod` | Schema validation for tools |

---

## Build Commands

```bash
# Install dependencies
pnpm install

# Build all packages (respects dependency order)
pnpm build

# Build individual packages
pnpm --filter @origen/tokens build
pnpm --filter @origen/react build
pnpm --filter @origen/mcp build

# Development
pnpm dev                          # All packages
pnpm --filter @origen/mcp dev     # MCP server only

# Lint
pnpm lint
```

---

## Build Order (Critical)

**Turbo handles this via `dependsOn: ["^build"]`, but understand the chain:**

```
1. @origen/tokens     → Outputs: build/css/tokens.css, build/tokens.js
        ↓
2. @origen/react      → Depends on tokens CSS, outputs: dist/
        ↓
3. @origen/mcp        → Depends on tokens.js and component specs
```

**Never build react before tokens. Never build mcp before tokens.**

---

## Code Patterns

### Token Files (DTCG Format)

```json
{
  "color": {
    "$type": "color",
    "blue": {
      "500": { "$value": "#3b82f6" }
    }
  }
}
```

- Use `$type` at group level, `$value` at leaf level
- Semantic tokens reference primitives: `{ "$value": "{color.blue.500}" }`

### Component Structure

```
components/button/
├── button.tsx           # Component implementation
├── button.variants.ts   # cva() variant definitions
└── index.ts             # Exports
```

### Variant Pattern (CVA)

```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  ["base-classes"],
  {
    variants: {
      variant: { default: "...", destructive: "..." },
      size: { sm: "...", default: "...", lg: "..." },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

### Component Pattern

```typescript
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={twMerge(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

### MCP Tool Pattern

```typescript
server.tool(
  "tool_name",
  "Description of what this tool does",
  {
    param: z.enum(["a", "b"]).describe("Param description"),
  },
  async ({ param }) => {
    return {
      content: [{ type: "text", text: "result" }],
    };
  }
);
```

---

## Semantic Token Names

Use these consistently across all packages:

| Token | Light | Dark |
|-------|-------|------|
| `background` | white | slate-950 |
| `foreground` | slate-950 | slate-50 |
| `primary` | blue-600 | blue-500 |
| `primary-foreground` | white | white |
| `secondary` | slate-100 | slate-800 |
| `secondary-foreground` | slate-900 | slate-50 |
| `muted` | slate-100 | slate-800 |
| `muted-foreground` | slate-500 | slate-400 |
| `destructive` | red-600 | red-500 |
| `destructive-foreground` | white | white |
| `card` | white | slate-900 |
| `card-foreground` | slate-950 | slate-50 |
| `border` | slate-200 | slate-800 |
| `input` | slate-200 | slate-800 |
| `ring` | blue-500 | blue-400 |

---

## Component Roster (v0.1)

| Component | Type | Notes |
|-----------|------|-------|
| Button | Simple | CVA variants, no Base UI |
| Input | Simple | Native input with styling |
| Card | Compound | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Select | Complex | Uses `@base-ui-components/react` Select |
| Modal | Complex | Uses `@base-ui-components/react` Dialog |

---

## MCP Tools

| Tool | Purpose |
|------|---------|
| `get_tokens` | Get tokens by category (colors, spacing, typography, radius) and theme |
| `get_component_spec` | Get full spec for a component (props, variants, tokens, usage) |
| `get_code` | Generate implementation code with specified props |
| `search_components` | Search components by description or use case |

---

## Critical Rules (DO NOT)

### Tokens
- **DO NOT** use non-DTCG format (no `value`, must be `$value`)
- **DO NOT** hardcode colors in components — always use semantic tokens
- **DO NOT** skip the Style Dictionary build step

### React Components
- **DO NOT** use Radix UI — use `@base-ui-components/react` for complex components
- **DO NOT** use `cn()` helper — use `twMerge()` directly
- **DO NOT** forget `"use client"` banner in tsup config
- **DO NOT** forget `displayName` on forwardRef components
- **DO NOT** inline styles — all styling via Tailwind classes
- **DO NOT** create components without variant types exported

### MCP Server
- **DO NOT** use stdio transport — this is Vercel HTTP deployment
- **DO NOT** forget zod schemas for all tool parameters
- **DO NOT** return raw objects — always wrap in `{ content: [{ type: "text", text: ... }] }`

### General
- **DO NOT** use npm or yarn — this is a pnpm workspace
- **DO NOT** modify turbo.json build order
- **DO NOT** publish packages without building first
- **DO NOT** add dependencies to root — add to specific packages

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Token files | `*.tokens.json` | `colors.tokens.json` |
| Component | `kebab-case.tsx` | `button.tsx` |
| Variants | `*.variants.ts` | `button.variants.ts` |
| MCP tools | `kebab-case.ts` | `get-tokens.ts` |

---

## CSS Variable Naming

```css
/* Primitives */
--color-{scale}-{value}    /* --color-slate-500 */
--spacing-{value}          /* --spacing-4 */
--radius-{value}           /* --radius-md */

/* Semantic */
--color-{semantic}         /* --color-primary */
```

---

## Tailwind Theme Integration

In `globals.css`, map CSS variables to Tailwind:

```css
@import "tailwindcss";
@import "@origen/tokens/build/css/tokens.css";

@theme inline {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  /* ... all semantic tokens */
}
```

This allows using `bg-background`, `text-primary`, etc. in components.

---

## Testing Checklist

- [ ] Tokens build produces valid CSS variables
- [ ] React components render in light and dark mode
- [ ] All CVA variants work correctly
- [ ] Base UI components (Select, Modal) are accessible
- [ ] MCP tools return valid JSON
- [ ] MCP resources are queryable

---

## Quick Reference: Component Props

### Button
- `variant`: default | destructive | outline | secondary | ghost | link
- `size`: sm | default | lg | icon

### Input
- Standard HTML input attributes
- Styled via Tailwind classes

### Card
- No props, uses subcomponents for structure

### Select
- `options`: `{ value: string; label: string }[]`
- `value`, `onValueChange`, `placeholder`, `disabled`

### Modal
- `open`, `onOpenChange`
- Subcomponents: `Modal.Trigger`, `Modal.Content`
