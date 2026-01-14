# Origen

**The MCP-native design system for the AI era.**

Origen exposes components, tokens, and specifications through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io), allowing AI agents to query design decisions, generate implementation code, and maintain design-code consistency.

## Packages

| Package | Description |
|---------|-------------|
| `@origen/tokens` | Design tokens in W3C DTCG format |
| `@origen/react` | React component library |
| `@origen/mcp` | MCP server for AI integration |

## Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Using React Components

Install the React package in your project:

```bash
pnpm add @origen/react @origen/tokens
```

Import and use components:

```tsx
import { Button, Input, Card, Select, Modal } from "@origen/react";
import "@origen/tokens/build/css/tokens.css";

function App() {
  return (
    <div>
      <Button variant="default" size="lg">
        Click me
      </Button>

      <Input placeholder="Enter text..." />

      <Card>
        <Card.Header>
          <Card.Title>Card Title</Card.Title>
          <Card.Description>Card description here</Card.Description>
        </Card.Header>
        <Card.Content>Content goes here</Card.Content>
        <Card.Footer>Footer actions</Card.Footer>
      </Card>

      <Select
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
        ]}
        placeholder="Select an option"
      />
    </div>
  );
}
```

### Available Components

| Component | Type | Description |
|-----------|------|-------------|
| Button | Simple | Interactive button with 6 variants and 4 sizes |
| Input | Simple | Text input field |
| Card | Compound | Container with Header, Title, Description, Content, Footer |
| Select | Complex | Dropdown selection (Base UI) |
| Modal | Complex | Dialog/modal overlay (Base UI) |

### Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔔</Button>
```

## Using MCP Server

### Configuring Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "origen": {
      "url": "https://your-vercel-deployment.vercel.app/api/mcp"
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `get_tokens` | Get design tokens by category (colors, spacing, typography, radius) |
| `get_component_spec` | Get complete specification for a component |
| `get_code` | Generate implementation code with specified props |
| `search_components` | Search components by description or use case |
| `compose_interface` | Generate composed UI from natural language intent |
| `get_layout_pattern` | Get pre-built layout patterns with structure and code |
| `validate_accessibility` | Validate JSX/components for WCAG 2.1 AA accessibility |

### Example MCP Queries

**Get color tokens:**
```
Use the get_tokens tool with category "colors" and theme "light"
```

**Get Button specification:**
```
Use the get_component_spec tool with component "button"
```

**Generate code:**
```
Use the get_code tool to generate a destructive large Button with text "Delete"
```

**Search components:**
```
Use the search_components tool with query "form input"
```

**Compose an interface:**
```
Use the compose_interface tool with intent "create a login form with email and password"
```

**Get a layout pattern:**
```
Use the get_layout_pattern tool with pattern "form-layout" and options.title "Contact Us"
```

**Validate accessibility:**
```
Use the validate_accessibility tool with code "<Input placeholder='Email' />"
```

### MCP Resources

The MCP server also exposes resources:

| Resource URI | Description |
|--------------|-------------|
| `tokens://all` | All design tokens |
| `tokens://colors` | Color tokens |
| `tokens://spacing` | Spacing tokens |
| `tokens://typography` | Typography tokens |
| `component://button` | Button specification |
| `component://input` | Input specification |
| `component://card` | Card specification |
| `component://select` | Select specification |
| `component://modal` | Modal specification |

## Design Tokens

Tokens follow the [W3C Design Token Community Group (DTCG)](https://design-tokens.github.io/community-group/format/) format:

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

### Semantic Tokens

| Token | Light | Dark |
|-------|-------|------|
| `background` | white | slate-950 |
| `foreground` | slate-950 | slate-50 |
| `primary` | blue-600 | blue-500 |
| `secondary` | slate-100 | slate-800 |
| `destructive` | red-600 | red-500 |
| `muted` | slate-100 | slate-800 |
| `border` | slate-200 | slate-800 |

## Development

```bash
# Run all packages in dev mode
pnpm dev

# Build specific package
pnpm --filter @origen/tokens build
pnpm --filter @origen/react build
pnpm --filter @origen/mcp build

# Lint
pnpm lint

# Test MCP tools
npx tsx scripts/test-mcp.ts
```

## Deployment

The MCP server is configured for Vercel deployment. Deploy the `packages/mcp` directory:

```bash
cd packages/mcp
vercel deploy
```

## License

MIT
