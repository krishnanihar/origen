# Origen MCP Development Progress

## Completed

### compose_interface Tool
- Implemented with `registerTool()` pattern (new MCP SDK API)
- Uses `outputSchema` for typed AI responses
- Returns `structuredContent` alongside human-readable `content`
- 42 tests passing

**Features:**
- Natural language intent parsing ("login form", "user profile", etc.)
- Dynamic field detection (email, password, phone, etc.)
- Slot-based component assembly (header, content, footer)
- JSX code generation
- Token collection

**Intent Patterns:**
| Pattern | Components |
|---------|------------|
| login/signin | Card + email/password Inputs + Button |
| profile/account | Card + title/description + Button |
| form | Card + dynamic Inputs + Button |
| navigation/header | flex row of ghost Buttons |
| settings | Card + Select + Button |
| modal/dialog | Modal + trigger Button |

### get_layout_pattern Tool
- Implemented with `registerTool()` pattern (new MCP SDK API)
- Uses `outputSchema` for typed AI responses
- Returns `structuredContent` alongside human-readable `content`
- 104 tests passing

**Features:**
- Explicit pattern selection (7 pre-built patterns)
- Customization options (title, description, columns, actions, variant)
- Structure metadata (type, direction, gap, columns)
- Slot definitions for composition points
- Usage guidance with when/examples
- JSX code generation

**Layout Patterns:**
| Pattern | Structure | Components |
|---------|-----------|------------|
| form-layout | stack | Card + CardHeader + CardContent + CardFooter + Input + Button |
| split-view | grid (2 cols) | aside + nav + main + Button |
| dashboard-grid | grid (n cols) | Card grid with stat cards |
| modal-confirm | stack | Modal + Modal.Trigger + Modal.Content + Button |
| list-with-actions | stack | Card + CardContent + divide-y items + Button |
| hero-section | flex | section + h1 + p + Button |
| empty-state | flex | div + icon + h3 + p + Button |

## Current Tools

| Tool | API Pattern | Status |
|------|-------------|--------|
| get_tokens | `server.tool()` | Stable |
| get_component_spec | `server.tool()` | Stable |
| get_code | `server.tool()` | Stable |
| search_components | `server.tool()` | Stable |
| compose_interface | `server.registerTool()` | New |
| get_layout_pattern | `server.registerTool()` | New |

## Next Steps

### Planned Tools
- `validate_accessibility` — Check component usage for a11y issues
- `suggest_pattern` — Recommend layout pattern based on use case description

### Considerations
- Migrate existing tools to `registerTool()` pattern for consistency
- Add `outputSchema` to existing tools for typed responses
- Expand intent patterns for compose_interface

## Architecture Notes

### registerTool() vs tool()

The new `registerTool()` API provides:
- `title` field separate from tool name
- `outputSchema` for typed responses
- `structuredContent` in handler return

```typescript
server.registerTool(
  "tool_name",
  {
    title: "Display Title",
    description: "...",
    inputSchema: { ... },
    outputSchema: { ... }
  },
  async (input) => ({
    content: [{ type: "text", text: "..." }],
    structuredContent: { ... }  // Typed output
  })
);
```
