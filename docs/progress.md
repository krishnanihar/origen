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

## Current Tools

| Tool | API Pattern | Status |
|------|-------------|--------|
| get_tokens | `server.tool()` | Stable |
| get_component_spec | `server.tool()` | Stable |
| get_code | `server.tool()` | Stable |
| search_components | `server.tool()` | Stable |
| compose_interface | `server.registerTool()` | New |

## Next Steps

### Planned Tools
- `get_layout_pattern` — Return layout templates for common UI patterns
- `validate_accessibility` — Check component usage for a11y issues

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
