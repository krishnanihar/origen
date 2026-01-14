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

### validate_accessibility Tool
- Implemented with `registerTool()` pattern (new MCP SDK API)
- Uses `outputSchema` for typed AI responses
- Returns `structuredContent` alongside human-readable `content`
- 60 tests passing

**Features:**
- Static WCAG 2.1 AA validation (no rendering required)
- Accepts JSX code string or component array
- Validates Input, Button, Modal.Content, Select, img
- Returns severity-graded issues with suggestions
- Calculates accessibility score (0-100)
- Tracks passed rules

**Validation Rules:**
| Rule | Severity | WCAG | Component |
|------|----------|------|-----------|
| input-needs-label | error | 1.3.1, 4.1.2 | Input |
| button-needs-name | error | 4.1.2 | Button |
| modal-needs-label | error | 4.1.2 | Modal.Content |
| select-needs-label | error | 1.3.1, 4.1.2 | Select |
| img-needs-alt | error | 1.1.1 | img |
| placeholder-not-label | warning | 3.3.2 | Input |
| modal-needs-description | warning | 4.1.2 | Modal.Content |
| redundant-alt | warning | 1.1.1 | img |

## Current Tools

All 7 tools now use the `registerTool()` pattern with typed `outputSchema` and `structuredContent`.

| Tool | API Pattern | Output Schema | Status |
|------|-------------|---------------|--------|
| get_tokens | `server.registerTool()` | category, theme, primitives, semantic | Stable |
| get_component_spec | `server.registerTool()` | name, description, props, tokens, accessibility, usage, examples | Stable |
| get_code | `server.registerTool()` | code, component, imports, dependencies, framework, props | Stable |
| search_components | `server.registerTool()` | query, results (with score), count, hasMore | Stable |
| compose_interface | `server.registerTool()` | layout, components, code, tokens, suggestions | Stable |
| get_layout_pattern | `server.registerTool()` | pattern, structure, components, code, tokens, slots, usage | Stable |
| validate_accessibility | `server.registerTool()` | valid, score, issues, summary, passedRules | Stable |

## Next Steps

### Planned Tools
- `suggest_pattern` — Recommend layout pattern based on use case description
- `generate_theme` — Create custom theme tokens from base colors

### Planned Improvements
- AI-native components with built-in context awareness
- OKLCH color system for perceptually uniform color manipulation
- Expand intent patterns for compose_interface

## Architecture Notes

### registerTool() Pattern

All tools now use the `registerTool()` API which provides:
- `title` field separate from tool name
- `inputSchema` for validated input parameters
- `outputSchema` for typed responses
- `structuredContent` in handler return alongside human-readable `content`

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
    content: [{ type: "text", text: "Human-readable summary" }],
    structuredContent: { ... }  // Typed output matching outputSchema
  })
);
```

### Migration Complete

All 4 original tools (`get_tokens`, `get_component_spec`, `get_code`, `search_components`) were migrated from the legacy `server.tool()` API to `server.registerTool()` with full `outputSchema` support. See [docs/tool-migration-plan.md](tool-migration-plan.md) for migration details.
