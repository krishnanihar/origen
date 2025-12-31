# Origen — MCP-Native Design System

> The first design system built for the AI era. Query components, generate code, understand tokens — all through MCP.

## Overview

Origen is an open-source design system that exposes its components, tokens, and specifications through the Model Context Protocol (MCP). AI agents can query Origen to understand design decisions, generate implementation code, and maintain design-code consistency.

**Creator**: Knih ([@knih](https://github.com/knih))

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONSUMERS                                │
│  Claude Code │ Cursor │ Windsurf │ VS Code │ Any MCP Client     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORIGEN MCP SERVER                             │
│  Deployed on Vercel (Streamable HTTP)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   TOOLS     │ │  RESOURCES  │ │   PROMPTS   │               │
│  │ get_tokens  │ │ tokens://   │ │ component   │               │
│  │ get_spec    │ │ components: │ │ guidelines  │               │
│  │ get_code    │ │ //          │ │             │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ @origen/tokens  │ │ @origen/react   │ │ Figma Community │
│ DTCG JSON       │ │ React + Tailwind│ │ Variables +     │
│ CSS Variables   │ │ Base UI prims   │ │ Components      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Monorepo Structure

```
origen/
├── apps/
│   └── docs/                    # Minimal Storybook docs
├── packages/
│   ├── tokens/                  # Design tokens (DTCG format)
│   │   ├── src/
│   │   │   ├── primitives/
│   │   │   │   ├── colors.tokens.json
│   │   │   │   ├── spacing.tokens.json
│   │   │   │   └── typography.tokens.json
│   │   │   ├── semantic/
│   │   │   │   ├── light.tokens.json
│   │   │   │   └── dark.tokens.json
│   │   │   └── index.tokens.json
│   │   ├── build/               # Style Dictionary output
│   │   │   ├── css/
│   │   │   │   └── tokens.css
│   │   │   └── tailwind-theme.js
│   │   ├── config.js            # Style Dictionary config
│   │   └── package.json
│   ├── react/                   # React component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── button.variants.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── input/
│   │   │   │   ├── card/
│   │   │   │   ├── select/      # Uses Base UI
│   │   │   │   └── modal/       # Uses Base UI
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   └── index.ts
│   │   ├── tsup.config.ts
│   │   └── package.json
│   └── mcp/                     # MCP server
│       ├── src/
│       │   ├── server.ts
│       │   ├── tools/
│       │   │   ├── get-tokens.ts
│       │   │   ├── get-component-spec.ts
│       │   │   └── get-code.ts
│       │   ├── resources/
│       │   │   ├── tokens.ts
│       │   │   └── components.ts
│       │   └── data/
│       │       └── component-specs.json
│       ├── vercel.json
│       └── package.json
├── .github/
│   └── workflows/
│       └── publish.yml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Package Specifications

### 1. @origen/tokens

**Purpose**: W3C DTCG-compliant design tokens with Style Dictionary build pipeline.

#### Token Structure (Primitive → Semantic)

**primitives/colors.tokens.json**
```json
{
  "color": {
    "$type": "color",
    "slate": {
      "50": { "$value": "#f8fafc" },
      "100": { "$value": "#f1f5f9" },
      "200": { "$value": "#e2e8f0" },
      "300": { "$value": "#cbd5e1" },
      "400": { "$value": "#94a3b8" },
      "500": { "$value": "#64748b" },
      "600": { "$value": "#475569" },
      "700": { "$value": "#334155" },
      "800": { "$value": "#1e293b" },
      "900": { "$value": "#0f172a" },
      "950": { "$value": "#020617" }
    },
    "blue": {
      "50": { "$value": "#eff6ff" },
      "100": { "$value": "#dbeafe" },
      "200": { "$value": "#bfdbfe" },
      "300": { "$value": "#93c5fd" },
      "400": { "$value": "#60a5fa" },
      "500": { "$value": "#3b82f6" },
      "600": { "$value": "#2563eb" },
      "700": { "$value": "#1d4ed8" },
      "800": { "$value": "#1e40af" },
      "900": { "$value": "#1e3a8a" },
      "950": { "$value": "#172554" }
    },
    "red": {
      "500": { "$value": "#ef4444" },
      "600": { "$value": "#dc2626" }
    },
    "green": {
      "500": { "$value": "#22c55e" },
      "600": { "$value": "#16a34a" }
    },
    "white": { "$value": "#ffffff" },
    "black": { "$value": "#000000" }
  }
}
```

**primitives/spacing.tokens.json**
```json
{
  "spacing": {
    "$type": "dimension",
    "0": { "$value": "0px" },
    "1": { "$value": "4px" },
    "2": { "$value": "8px" },
    "3": { "$value": "12px" },
    "4": { "$value": "16px" },
    "5": { "$value": "20px" },
    "6": { "$value": "24px" },
    "8": { "$value": "32px" },
    "10": { "$value": "40px" },
    "12": { "$value": "48px" },
    "16": { "$value": "64px" }
  }
}
```

**primitives/typography.tokens.json**
```json
{
  "fontFamily": {
    "$type": "fontFamily",
    "sans": { "$value": ["Inter", "system-ui", "sans-serif"] },
    "mono": { "$value": ["JetBrains Mono", "monospace"] }
  },
  "fontSize": {
    "$type": "dimension",
    "xs": { "$value": "12px" },
    "sm": { "$value": "14px" },
    "base": { "$value": "16px" },
    "lg": { "$value": "18px" },
    "xl": { "$value": "20px" },
    "2xl": { "$value": "24px" },
    "3xl": { "$value": "30px" }
  },
  "fontWeight": {
    "$type": "fontWeight",
    "normal": { "$value": 400 },
    "medium": { "$value": 500 },
    "semibold": { "$value": 600 },
    "bold": { "$value": 700 }
  },
  "lineHeight": {
    "$type": "number",
    "tight": { "$value": 1.25 },
    "normal": { "$value": 1.5 },
    "relaxed": { "$value": 1.75 }
  },
  "radius": {
    "$type": "dimension",
    "none": { "$value": "0px" },
    "sm": { "$value": "4px" },
    "md": { "$value": "6px" },
    "lg": { "$value": "8px" },
    "xl": { "$value": "12px" },
    "full": { "$value": "9999px" }
  }
}
```

**semantic/light.tokens.json**
```json
{
  "color": {
    "$type": "color",
    "background": { "$value": "{color.white}" },
    "foreground": { "$value": "{color.slate.950}" },
    "muted": { "$value": "{color.slate.100}" },
    "muted-foreground": { "$value": "{color.slate.500}" },
    "card": { "$value": "{color.white}" },
    "card-foreground": { "$value": "{color.slate.950}" },
    "border": { "$value": "{color.slate.200}" },
    "input": { "$value": "{color.slate.200}" },
    "primary": { "$value": "{color.blue.600}" },
    "primary-foreground": { "$value": "{color.white}" },
    "secondary": { "$value": "{color.slate.100}" },
    "secondary-foreground": { "$value": "{color.slate.900}" },
    "destructive": { "$value": "{color.red.600}" },
    "destructive-foreground": { "$value": "{color.white}" },
    "success": { "$value": "{color.green.600}" },
    "success-foreground": { "$value": "{color.white}" },
    "ring": { "$value": "{color.blue.500}" }
  }
}
```

**semantic/dark.tokens.json**
```json
{
  "color": {
    "$type": "color",
    "background": { "$value": "{color.slate.950}" },
    "foreground": { "$value": "{color.slate.50}" },
    "muted": { "$value": "{color.slate.800}" },
    "muted-foreground": { "$value": "{color.slate.400}" },
    "card": { "$value": "{color.slate.900}" },
    "card-foreground": { "$value": "{color.slate.50}" },
    "border": { "$value": "{color.slate.800}" },
    "input": { "$value": "{color.slate.800}" },
    "primary": { "$value": "{color.blue.500}" },
    "primary-foreground": { "$value": "{color.white}" },
    "secondary": { "$value": "{color.slate.800}" },
    "secondary-foreground": { "$value": "{color.slate.50}" },
    "destructive": { "$value": "{color.red.500}" },
    "destructive-foreground": { "$value": "{color.white}" },
    "success": { "$value": "{color.green.500}" },
    "success-foreground": { "$value": "{color.white}" },
    "ring": { "$value": "{color.blue.400}" }
  }
}
```

**config.js (Style Dictionary)**
```javascript
export default {
  source: ['src/**/*.tokens.json'],
  preprocessors: ['tokens-studio'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: {
          outputReferences: true
        }
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
};
```

**Output CSS (build/css/tokens.css)**
```css
:root {
  /* Primitives */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  /* ... */
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  /* ... */
  --spacing-1: 4px;
  --spacing-2: 8px;
  /* ... */
  --radius-md: 6px;
  --radius-lg: 8px;
  /* ... */
  
  /* Semantic (Light) */
  --color-background: var(--color-white);
  --color-foreground: var(--color-slate-950);
  --color-primary: var(--color-blue-600);
  --color-primary-foreground: var(--color-white);
  /* ... */
}

.dark {
  --color-background: var(--color-slate-950);
  --color-foreground: var(--color-slate-50);
  --color-primary: var(--color-blue-500);
  /* ... */
}
```

---

### 2. @origen/react

**Purpose**: React component library with Tailwind CSS styling, using Base UI for complex components.

#### Dependencies

```json
{
  "dependencies": {
    "@base-ui/react": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@origen/tokens": "workspace:*"
  }
}
```

#### styles/globals.css

```css
@import "tailwindcss";
@import "@origen/tokens/build/css/tokens.css";

@theme inline {
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-primary: var(--color-primary);
  --color-primary-foreground: var(--color-primary-foreground);
  --color-secondary: var(--color-secondary);
  --color-secondary-foreground: var(--color-secondary-foreground);
  --color-destructive: var(--color-destructive);
  --color-destructive-foreground: var(--color-destructive-foreground);
  --color-muted: var(--color-muted);
  --color-muted-foreground: var(--color-muted-foreground);
  --color-card: var(--color-card);
  --color-card-foreground: var(--color-card-foreground);
  --color-border: var(--color-border);
  --color-input: var(--color-input);
  --color-ring: var(--color-ring);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
}
```

#### Component Implementations

**components/button/button.variants.ts**
```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-muted hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        default: "h-10 px-4 text-sm rounded-md",
        lg: "h-11 px-6 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

**components/button/button.tsx**
```typescript
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { buttonVariants, type ButtonVariants } from "./button.variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean;
}

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

**components/input/input.tsx**
```typescript
import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
```

**components/card/card.tsx**
```typescript
import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={twMerge("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={twMerge("text-sm text-muted-foreground", className)}
    {...props}
  />
));

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={twMerge("p-6 pt-0", className)} {...props} />
));

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={twMerge("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
```

**components/select/select.tsx** (Base UI)
```typescript
import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { twMerge } from "tailwind-merge";

export interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled,
  className,
}: SelectProps) {
  return (
    <BaseSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <BaseSelect.Trigger
        className={twMerge(
          "flex h-10 w-full items-center justify-between rounded-md border border-input",
          "bg-background px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner>
          <BaseSelect.Popup
            className={twMerge(
              "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border",
              "bg-card text-card-foreground shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
          >
            {options.map((option) => (
              <BaseSelect.Option
                key={option.value}
                value={option.value}
                className={twMerge(
                  "relative flex cursor-pointer select-none items-center",
                  "rounded-sm px-2 py-1.5 text-sm outline-none",
                  "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                )}
              >
                <BaseSelect.OptionIndicator className="mr-2">
                  <CheckIcon className="h-4 w-4" />
                </BaseSelect.OptionIndicator>
                <BaseSelect.OptionText>{option.label}</BaseSelect.OptionText>
              </BaseSelect.Option>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
```

**components/modal/modal.tsx** (Base UI)
```typescript
import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  );
}

export function ModalTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <BaseDialog.Trigger className={className}>
      {children}
    </BaseDialog.Trigger>
  );
}

export function ModalContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className={twMerge(
          "fixed inset-0 z-50 bg-black/80",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
      />
      <BaseDialog.Popup
        className={twMerge(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
      >
        {title && (
          <BaseDialog.Title className="text-lg font-semibold text-foreground">
            {title}
          </BaseDialog.Title>
        )}
        {description && (
          <BaseDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </BaseDialog.Description>
        )}
        <div className="mt-4">{children}</div>
        <BaseDialog.Close
          className={twMerge(
            "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;
```

**index.ts**
```typescript
export { Button, type ButtonProps } from "./components/button";
export { Input, type InputProps } from "./components/input";
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  type CardProps 
} from "./components/card";
export { Select, type SelectProps } from "./components/select";
export { Modal, ModalTrigger, ModalContent, type ModalProps } from "./components/modal";
```

---

### 3. @origen/mcp

**Purpose**: MCP server deployed on Vercel, exposing design system tools and resources.

#### Server Implementation

**src/server.ts**
```typescript
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import componentSpecs from "./data/component-specs.json";
import tokens from "@origen/tokens/build/tokens.js";

export const server = new McpServer({
  name: "origen",
  version: "1.0.0",
});

// ============ TOOLS ============

server.tool(
  "get_tokens",
  "Get design tokens by category (colors, spacing, typography, radius). Returns DTCG-format tokens.",
  {
    category: z
      .enum(["all", "colors", "spacing", "typography", "radius"])
      .default("all")
      .describe("Token category to retrieve"),
    theme: z
      .enum(["light", "dark"])
      .default("light")
      .describe("Theme mode for semantic tokens"),
  },
  async ({ category, theme }) => {
    const result = filterTokens(tokens, category, theme);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_component_spec",
  "Get complete specification for a component including props, variants, tokens, and usage guidelines.",
  {
    component: z
      .enum(["button", "input", "card", "select", "modal"])
      .describe("Component name"),
  },
  async ({ component }) => {
    const spec = componentSpecs[component];
    if (!spec) {
      return {
        content: [{ type: "text", text: `Component "${component}" not found.` }],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(spec, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_code",
  "Generate implementation code for a component with specified props.",
  {
    component: z.enum(["button", "input", "card", "select", "modal"]),
    props: z.record(z.any()).optional().describe("Props to apply to component"),
    children: z.string().optional().describe("Children content"),
  },
  async ({ component, props = {}, children }) => {
    const code = generateComponentCode(component, props, children);
    return {
      content: [
        {
          type: "text",
          text: `\`\`\`tsx\n${code}\n\`\`\``,
        },
      ],
    };
  }
);

server.tool(
  "search_components",
  "Search for components by description or use case.",
  {
    query: z.string().describe("Search query (e.g., 'form input', 'action button')"),
  },
  async ({ query }) => {
    const results = searchComponents(query, componentSpecs);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
);

// ============ RESOURCES ============

server.resource(
  "tokens://all",
  "Complete design token palette in DTCG format",
  async () => ({
    contents: [
      {
        uri: "tokens://all",
        mimeType: "application/json",
        text: JSON.stringify(tokens, null, 2),
      },
    ],
  })
);

server.resource(
  "component",
  new ResourceTemplate("components://{name}", { list: undefined }),
  async (uri, { name }) => {
    const spec = componentSpecs[name as string];
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: spec ? JSON.stringify(spec, null, 2) : "Not found",
        },
      ],
    };
  }
);

// ============ HELPERS ============

function filterTokens(allTokens: any, category: string, theme: string) {
  // Implementation to filter tokens by category and theme
  if (category === "all") return allTokens;
  return allTokens[category] || {};
}

function generateComponentCode(
  component: string,
  props: Record<string, any>,
  children?: string
): string {
  const propsString = Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === "string") return `${key}="${value}"`;
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(" ");

  const componentName = component.charAt(0).toUpperCase() + component.slice(1);
  
  if (children) {
    return `<${componentName} ${propsString}>\n  ${children}\n</${componentName}>`;
  }
  return `<${componentName} ${propsString} />`;
}

function searchComponents(query: string, specs: Record<string, any>) {
  const queryLower = query.toLowerCase();
  return Object.entries(specs)
    .filter(([name, spec]) => {
      const searchable = `${name} ${spec.description} ${spec.usage?.when?.join(" ")}`.toLowerCase();
      return searchable.includes(queryLower);
    })
    .map(([name, spec]) => ({
      name,
      description: spec.description,
      usage: spec.usage?.when,
    }));
}
```

**src/data/component-specs.json**
```json
{
  "button": {
    "name": "Button",
    "description": "Interactive element for triggering actions and events",
    "props": {
      "variant": {
        "type": "enum",
        "values": ["default", "destructive", "outline", "secondary", "ghost", "link"],
        "default": "default",
        "description": "Visual style variant"
      },
      "size": {
        "type": "enum",
        "values": ["sm", "default", "lg", "icon"],
        "default": "default",
        "description": "Size affecting padding and typography"
      },
      "disabled": {
        "type": "boolean",
        "default": false,
        "description": "Disables the button"
      },
      "asChild": {
        "type": "boolean",
        "default": false,
        "description": "Render as child element"
      }
    },
    "tokens": {
      "default": {
        "background": "color-primary",
        "foreground": "color-primary-foreground"
      },
      "destructive": {
        "background": "color-destructive",
        "foreground": "color-destructive-foreground"
      }
    },
    "accessibility": {
      "role": "button",
      "keyboardInteraction": ["Enter", "Space"]
    },
    "usage": {
      "when": [
        "Primary call-to-action",
        "Form submission",
        "Triggering dialogs or actions"
      ],
      "avoid": [
        "Navigation (use Link instead)",
        "Multiple primary buttons in same view"
      ]
    },
    "examples": [
      {
        "title": "Primary button",
        "code": "<Button>Click me</Button>"
      },
      {
        "title": "Destructive action",
        "code": "<Button variant=\"destructive\">Delete</Button>"
      },
      {
        "title": "With icon",
        "code": "<Button size=\"icon\"><PlusIcon /></Button>"
      }
    ]
  },
  "input": {
    "name": "Input",
    "description": "Text input field for user data entry",
    "props": {
      "type": {
        "type": "string",
        "default": "text",
        "description": "HTML input type"
      },
      "placeholder": {
        "type": "string",
        "description": "Placeholder text"
      },
      "disabled": {
        "type": "boolean",
        "default": false
      }
    },
    "tokens": {
      "background": "color-background",
      "border": "color-input",
      "focusRing": "color-ring"
    },
    "accessibility": {
      "role": "textbox",
      "requiresLabel": true
    },
    "usage": {
      "when": ["Single-line text entry", "Form fields"],
      "avoid": ["Multi-line content (use Textarea)"]
    }
  },
  "card": {
    "name": "Card",
    "description": "Container for grouping related content",
    "props": {},
    "subcomponents": ["CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter"],
    "tokens": {
      "background": "color-card",
      "foreground": "color-card-foreground",
      "border": "color-border"
    },
    "usage": {
      "when": ["Displaying grouped information", "Dashboard widgets", "Product cards"],
      "avoid": ["Deeply nested cards"]
    }
  },
  "select": {
    "name": "Select",
    "description": "Dropdown selection component for choosing from a list of options",
    "props": {
      "options": {
        "type": "array",
        "required": true,
        "description": "Array of { value, label } objects"
      },
      "value": {
        "type": "string",
        "description": "Controlled value"
      },
      "onValueChange": {
        "type": "function",
        "description": "Callback when value changes"
      },
      "placeholder": {
        "type": "string",
        "default": "Select an option"
      },
      "disabled": {
        "type": "boolean",
        "default": false
      }
    },
    "tokens": {
      "background": "color-background",
      "border": "color-input",
      "popupBackground": "color-card"
    },
    "accessibility": {
      "role": "combobox",
      "keyboardInteraction": ["ArrowUp", "ArrowDown", "Enter", "Escape"]
    },
    "usage": {
      "when": ["Selecting from predefined options", "Form fields with limited choices"],
      "avoid": ["Free-form input (use Input)", "Very long lists (use Combobox)"]
    }
  },
  "modal": {
    "name": "Modal",
    "description": "Overlay dialog for focused interactions",
    "props": {
      "open": {
        "type": "boolean",
        "description": "Controlled open state"
      },
      "onOpenChange": {
        "type": "function",
        "description": "Callback when open state changes"
      }
    },
    "subcomponents": ["Modal.Trigger", "Modal.Content"],
    "tokens": {
      "backdrop": "color-black/80",
      "background": "color-card",
      "border": "color-border"
    },
    "accessibility": {
      "role": "dialog",
      "focusTrap": true,
      "keyboardInteraction": ["Escape to close"]
    },
    "usage": {
      "when": ["Confirmations", "Forms requiring focus", "Critical information"],
      "avoid": ["Non-critical content", "Long forms (use dedicated page)"]
    }
  }
}
```

**Vercel Route Handler (app/api/mcp/route.ts)**
```typescript
import { createMcpHandler } from "mcp-handler";
import { server } from "../../../src/server";

const handler = createMcpHandler(
  () => server,
  {},
  { basePath: "/api" }
);

export { handler as GET, handler as POST, handler as DELETE };
```

**vercel.json**
```json
{
  "functions": {
    "app/api/mcp/route.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## Build Configuration

### Root package.json

```json
{
  "name": "origen",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "tokens:build": "pnpm --filter @origen/tokens build",
    "mcp:dev": "pnpm --filter @origen/mcp dev"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

### packages/react/tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    button: "src/components/button/index.ts",
    input: "src/components/input/index.ts",
    card: "src/components/card/index.ts",
    select: "src/components/select/index.ts",
    modal: "src/components/modal/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.banner = { js: '"use client"' };
  },
});
```

### packages/react/package.json

```json
{
  "name": "@origen/react",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./button": {
      "types": "./dist/button.d.ts",
      "import": "./dist/button.js",
      "require": "./dist/button.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@base-ui/react": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@origen/tokens": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  }
}
```

---

## Figma Structure

### File Organization

```
📄 Cover
   ├── Origen Logo
   ├── Version: 0.1.0
   ├── "MCP-Native Design System"
   └── Quick start instructions

📄 Tokens
   ├── Primitives (all color, spacing, radius, typography scales)
   └── Semantic (light/dark mode mappings)

📄 Components
   ├── Button (all variants + sizes)
   ├── Input (default, focus, error, disabled states)
   ├── Card (with subcomponents)
   ├── Select (closed, open, with options)
   └── Modal (trigger + content)

📄 Changelog
   └── v0.1.0 - Initial release
```

### Variables Structure

**Primitives Collection:**
- color/slate/50-950
- color/blue/50-950
- color/red/500-600
- color/green/500-600
- spacing/1-16
- radius/none-full

**Semantic Collection (Light + Dark modes):**
- color/background
- color/foreground
- color/primary
- color/primary-foreground
- color/secondary
- color/secondary-foreground
- color/muted
- color/muted-foreground
- color/destructive
- color/destructive-foreground
- color/border
- color/input
- color/ring
- color/card
- color/card-foreground

---

## Usage

### Installation

```bash
npm install @origen/react @origen/tokens
```

### Basic Setup

```tsx
// Import styles
import "@origen/tokens/build/css/tokens.css";
import "@origen/react/styles.css";

// Use components
import { Button, Card, CardHeader, CardTitle, CardContent } from "@origen/react";

export default function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Origen</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Get Started</Button>
      </CardContent>
    </Card>
  );
}
```

### MCP Client Configuration

**Claude Desktop / Cursor / Windsurf:**
```json
{
  "mcpServers": {
    "origen": {
      "url": "https://origen-mcp.vercel.app/api/mcp"
    }
  }
}
```

### Example MCP Queries

```
"What button variants does Origen have?"
→ Calls get_component_spec with component: "button"

"Give me the color tokens for dark mode"
→ Calls get_tokens with category: "colors", theme: "dark"

"Generate a destructive button with text Delete"
→ Calls get_code with component: "button", props: { variant: "destructive" }, children: "Delete"
```

---

## Deployment Checklist

### npm Publishing

1. [ ] Build all packages: `pnpm build`
2. [ ] Version bump: `pnpm version patch/minor/major`
3. [ ] Publish tokens: `pnpm --filter @origen/tokens publish`
4. [ ] Publish react: `pnpm --filter @origen/react publish`

### Vercel Deployment

1. [ ] Connect GitHub repo to Vercel
2. [ ] Set root directory to `packages/mcp`
3. [ ] Deploy
4. [ ] Test MCP endpoint: `https://your-app.vercel.app/api/mcp`

### Figma Community

1. [ ] Finalize all components
2. [ ] Add cover page with instructions
3. [ ] Publish to Figma Community
4. [ ] Update README with Figma link

---

## Future Roadmap

### v0.2.0
- [ ] Additional components: Tabs, Accordion, Tooltip
- [ ] Improved MCP tools: validate_usage, suggest_component
- [ ] Storybook documentation

### v0.3.0
- [ ] AI-native components: ChatInterface, StreamingText, ThinkingIndicator
- [ ] ChatGPT App Store submission
- [ ] Component analytics via MCP
