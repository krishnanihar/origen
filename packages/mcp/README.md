# @origen/mcp

MCP server for the Origen design system. Exposes design tokens, component specifications, and code generation tools through the Model Context Protocol.

## Tools

### get_tokens

Get design tokens by category (colors, spacing, typography, radius).

**Input:**
- `category` (enum) — "all" | "colors" | "spacing" | "typography" | "radius"
- `theme` (enum) — "light" | "dark"

### get_component_spec

Get complete specification for a component including props, variants, tokens, and usage guidelines.

**Input:**
- `component` (enum) — "button" | "input" | "card" | "select" | "modal"

### get_code

Generate implementation code for a component with specified props.

**Input:**
- `component` (enum) — "button" | "input" | "card" | "select" | "modal"
- `props` (object) — Props to apply to component
- `children` (string) — Children content

### search_components

Search for components by description or use case.

**Input:**
- `query` (string) — Search query (e.g., "form input", "action button")

### compose_interface

Generate UI interfaces from natural language.

**Input:**
- `intent` (string) — "login form", "user profile card", etc.
- `context` (enum) — "page" | "section" | "component"

**Output:**
- `layout` — container configuration (type, direction, gap)
- `components` — component list with props and slots
- `code` — ready-to-use JSX snippet
- `tokens` — design tokens used

**Example:**
```typescript
// Input
{ intent: "login form", context: "section" }

// Output
{
  layout: { type: "stack", direction: "column", gap: "4" },
  components: [
    { name: "Card", props: {}, slot: "wrapper" },
    { name: "Input", props: { type: "email" }, slot: "content" },
    { name: "Input", props: { type: "password" }, slot: "content" },
    { name: "Button", props: { variant: "default" }, slot: "footer" }
  ],
  code: "<Card>...</Card>",
  tokens: ["border", "card", "input", "primary"]
}
```

## Development

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build
pnpm build

# Run tests
pnpm test
```

## License

MIT
