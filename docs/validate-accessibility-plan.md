# validate_accessibility Tool Implementation Plan

## Overview

MCP tool for static accessibility validation of JSX code or component arrays. Validates against WCAG 2.1 AA requirements applicable to component usage patterns without requiring rendering.

**Key Features:**
- Accepts JSX code string OR structured component array (composable with compose_interface/get_layout_pattern)
- Returns severity-graded issues with actionable suggestions
- Provides accessibility score (0-100)
- Uses `registerTool()` API with `outputSchema` and `structuredContent`

---

## Input Schema

```typescript
export const validateAccessibilityInputSchema = {
  code: z
    .string()
    .optional()
    .describe("JSX code string to validate"),
  components: z
    .array(
      z.object({
        name: z.string(),
        props: z.record(z.any()),
        children: z.union([z.string(), z.array(z.any())]).optional(),
        slot: z.string().optional(),
      })
    )
    .optional()
    .describe("Component array from compose_interface or get_layout_pattern output"),
  context: z
    .enum(["form", "navigation", "content", "modal", "general"])
    .default("general")
    .describe("Context hint for validation (affects which rules apply)"),
};
```

**Validation:**
- At least one of `code` or `components` must be provided
- If both provided, `components` takes precedence (more structured = better validation)

---

## Output Schema

```typescript
export const validateAccessibilityOutputSchema = {
  valid: z.boolean().describe("True if no errors (warnings allowed)"),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Accessibility score: 100 = perfect, 0 = critical issues"),
  issues: z.array(
    z.object({
      severity: z.enum(["error", "warning", "info"]),
      rule: z.string().describe("Rule identifier (e.g., 'input-needs-label')"),
      wcag: z.string().optional().describe("WCAG criterion (e.g., '4.1.2')"),
      component: z.string().optional().describe("Component name if applicable"),
      message: z.string().describe("Human-readable issue description"),
      suggestion: z.string().describe("How to fix the issue"),
    })
  ),
  summary: z.string().describe("Human-readable summary"),
  passedRules: z.array(z.string()).describe("Rules that passed validation"),
};
```

---

## Types

```typescript
export type Severity = "error" | "warning" | "info";

export type ValidationContext = "form" | "navigation" | "content" | "modal" | "general";

export type ComponentInput = {
  name: string;
  props: Record<string, unknown>;
  children?: string | unknown[];
  slot?: string;
};

export type ValidateAccessibilityInput = {
  code?: string;
  components?: ComponentInput[];
  context?: ValidationContext;
};

export type AccessibilityIssue = {
  severity: Severity;
  rule: string;
  wcag?: string;
  component?: string;
  message: string;
  suggestion: string;
};

export type ValidateAccessibilityOutput = {
  valid: boolean;
  score: number;
  issues: AccessibilityIssue[];
  summary: string;
  passedRules: string[];
};
```

---

## Validation Rules

### Error-Level Rules (Block Accessibility)

| Rule ID | Component | WCAG | Condition | Message | Suggestion |
|---------|-----------|------|-----------|---------|------------|
| `input-needs-label` | Input | 1.3.1, 4.1.2 | Input without `aria-label`, `aria-labelledby`, or `id` (for label association) | "Input is missing an accessible label" | "Add aria-label, aria-labelledby, or associate with a Label using id" |
| `button-needs-name` | Button | 4.1.2 | Button without children text AND without `aria-label` | "Button has no accessible name" | "Add text content or aria-label to the Button" |
| `modal-needs-label` | Modal | 4.1.2 | Modal.Content without `title` prop AND without `aria-label`/`aria-labelledby` | "Modal dialog is missing an accessible label" | "Add title prop or aria-label/aria-labelledby to Modal.Content" |
| `select-needs-label` | Select | 1.3.1, 4.1.2 | Select without associated label | "Select is missing an accessible label" | "Add aria-label or associate with a Label element" |
| `img-needs-alt` | img | 1.1.1 | Image without `alt` prop | "Image is missing alt text" | "Add alt attribute with descriptive text, or alt='' for decorative images" |
| `interactive-needs-role` | div, span | 4.1.2 | Element with onClick but no `role` or `tabIndex` | "Interactive element missing role and keyboard support" | "Add role='button' and tabIndex={0}, or use a native Button" |

### Warning-Level Rules (Degraded Experience)

| Rule ID | Component | WCAG | Condition | Message | Suggestion |
|---------|-----------|------|-----------|---------|------------|
| `placeholder-not-label` | Input | 3.3.2 | Input has `placeholder` but no label | "Placeholder used as only label" | "Add a visible label; placeholder disappears when user types" |
| `icon-button-no-label` | Button | 4.1.2 | Button with only icon child (no text) and no `aria-label` | "Icon-only button may lack accessible name" | "Add aria-label describing the button action" |
| `modal-needs-description` | Modal | 4.1.2 | Modal.Content has `title` but no `description` or `aria-describedby` | "Modal dialog has no description for context" | "Add description prop or aria-describedby for additional context" |
| `heading-hierarchy` | h1-h6 | 1.3.1 | Heading levels skip (h1 -> h3) | "Heading hierarchy skips levels" | "Use sequential heading levels (h1 -> h2 -> h3)" |
| `link-ambiguous-text` | a, Button[variant=link] | 2.4.4 | Link text is generic ("click here", "read more") | "Link text is ambiguous out of context" | "Use descriptive link text that indicates destination" |
| `redundant-alt` | img | 1.1.1 | Alt text contains "image", "picture", "photo" | "Alt text contains redundant words" | "Remove 'image of' prefix; screen readers announce images" |

### Info-Level Rules (Best Practices)

| Rule ID | Component | WCAG | Condition | Message | Suggestion |
|---------|-----------|------|-----------|---------|------------|
| `form-needs-fieldset` | Input (multiple) | 1.3.1 | Multiple related form fields without fieldset/legend | "Related form fields not grouped" | "Wrap related inputs in fieldset with legend" |
| `autofocus-discouraged` | Any | 2.4.3 | Element has `autoFocus` prop | "autoFocus can disorient screen reader users" | "Avoid autoFocus; manage focus programmatically if needed" |
| `positive-tabindex` | Any | 2.4.3 | Element has `tabIndex > 0` | "Positive tabindex disrupts natural focus order" | "Use tabIndex={0} or tabIndex={-1} instead" |

---

## Scoring Algorithm

```typescript
function calculateScore(issues: AccessibilityIssue[]): number {
  const weights = {
    error: 25,    // Each error deducts 25 points
    warning: 10,  // Each warning deducts 10 points
    info: 2,      // Each info deducts 2 points
  };

  let score = 100;

  for (const issue of issues) {
    score -= weights[issue.severity];
  }

  // Minimum score is 0
  return Math.max(0, score);
}
```

**Score Interpretation:**
- 100: Perfect accessibility
- 80-99: Good (minor warnings)
- 60-79: Fair (has warnings, may have 1 error)
- 40-59: Poor (multiple errors)
- 0-39: Critical (major accessibility barriers)

---

## Implementation Functions

### parseJSXToComponents(code: string): ComponentInput[]

Lightweight JSX parser to extract component tree:

```typescript
function parseJSXToComponents(code: string): ComponentInput[] {
  const components: ComponentInput[] = [];

  // Regex patterns for JSX elements
  const selfClosingPattern = /<(\w+)([^>]*?)\/>/g;
  const openingPattern = /<(\w+)([^>]*?)>([^<]*)/g;

  // Extract component name
  // Extract props (simple key="value" and key={value} patterns)
  // Extract children text

  return components;
}
```

### validateComponent(component: ComponentInput, context: ValidationContext): AccessibilityIssue[]

Validate single component against rules:

```typescript
function validateComponent(
  component: ComponentInput,
  context: ValidationContext
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  switch (component.name) {
    case "Input":
      issues.push(...validateInput(component));
      break;
    case "Button":
      issues.push(...validateButton(component));
      break;
    case "Modal":
    case "Modal.Content":
      issues.push(...validateModal(component));
      break;
    case "Select":
      issues.push(...validateSelect(component));
      break;
    case "img":
      issues.push(...validateImage(component));
      break;
    // ... other components
  }

  return issues;
}
```

### Individual Validators

```typescript
function validateInput(component: ComponentInput): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const { props } = component;

  const hasAriaLabel = !!props["aria-label"];
  const hasAriaLabelledBy = !!props["aria-labelledby"];
  const hasId = !!props.id; // For label association
  const hasPlaceholder = !!props.placeholder;

  // Error: No accessible label at all
  if (!hasAriaLabel && !hasAriaLabelledBy && !hasId) {
    issues.push({
      severity: "error",
      rule: "input-needs-label",
      wcag: "1.3.1, 4.1.2",
      component: "Input",
      message: "Input is missing an accessible label",
      suggestion: "Add aria-label, aria-labelledby, or associate with a Label using id",
    });
  }

  // Warning: Only placeholder, no real label
  if (hasPlaceholder && !hasAriaLabel && !hasAriaLabelledBy) {
    issues.push({
      severity: "warning",
      rule: "placeholder-not-label",
      wcag: "3.3.2",
      component: "Input",
      message: "Placeholder used as only visible indicator",
      suggestion: "Add a visible label; placeholder disappears when user types",
    });
  }

  return issues;
}

function validateButton(component: ComponentInput): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const { props, children } = component;

  const hasAriaLabel = !!props["aria-label"];
  const hasTextContent = typeof children === "string" && children.trim().length > 0;

  // Error: No accessible name
  if (!hasAriaLabel && !hasTextContent) {
    issues.push({
      severity: "error",
      rule: "button-needs-name",
      wcag: "4.1.2",
      component: "Button",
      message: "Button has no accessible name",
      suggestion: "Add text content or aria-label to the Button",
    });
  }

  // Warning: Icon-only button (children is array or object, not text)
  if (!hasAriaLabel && !hasTextContent && children) {
    issues.push({
      severity: "warning",
      rule: "icon-button-no-label",
      wcag: "4.1.2",
      component: "Button",
      message: "Icon-only button may lack accessible name",
      suggestion: "Add aria-label describing the button action",
    });
  }

  return issues;
}

function validateModal(component: ComponentInput): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const { props } = component;

  const hasTitle = !!props.title;
  const hasAriaLabel = !!props["aria-label"];
  const hasAriaLabelledBy = !!props["aria-labelledby"];
  const hasDescription = !!props.description;
  const hasAriaDescribedBy = !!props["aria-describedby"];

  // Error: No accessible label
  if (!hasTitle && !hasAriaLabel && !hasAriaLabelledBy) {
    issues.push({
      severity: "error",
      rule: "modal-needs-label",
      wcag: "4.1.2",
      component: "Modal.Content",
      message: "Modal dialog is missing an accessible label",
      suggestion: "Add title prop or aria-label/aria-labelledby to Modal.Content",
    });
  }

  // Warning: No description
  if (hasTitle && !hasDescription && !hasAriaDescribedBy) {
    issues.push({
      severity: "warning",
      rule: "modal-needs-description",
      wcag: "4.1.2",
      component: "Modal.Content",
      message: "Modal dialog has no description for context",
      suggestion: "Add description prop or aria-describedby for additional context",
    });
  }

  return issues;
}
```

---

## Test Cases

### Input Validation Tests

```typescript
describe("Input validation", () => {
  // ERRORS
  it("should error when Input has no label", () => {
    const result = validateAccessibility({
      components: [{ name: "Input", props: { type: "text" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "input-needs-label", severity: "error" })
    );
  });

  it("should error when Input has only placeholder", () => {
    const result = validateAccessibility({
      components: [{ name: "Input", props: { placeholder: "Email" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "input-needs-label", severity: "error" })
    );
  });

  // WARNINGS
  it("should warn when Input uses placeholder without visible label", () => {
    const result = validateAccessibility({
      components: [{ name: "Input", props: { id: "email", placeholder: "Email" } }],
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "placeholder-not-label", severity: "warning" })
    );
  });

  // PASSING
  it("should pass when Input has aria-label", () => {
    const result = validateAccessibility({
      components: [{ name: "Input", props: { "aria-label": "Email address" } }],
    });
    expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(0);
  });

  it("should pass when Input has aria-labelledby", () => {
    const result = validateAccessibility({
      components: [{ name: "Input", props: { "aria-labelledby": "email-label" } }],
    });
    expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(0);
  });

  it("should pass when Input has id (for Label association)", () => {
    const result = validateAccessibility({
      components: [{ name: "Input", props: { id: "email" } }],
    });
    expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(0);
  });
});
```

### Button Validation Tests

```typescript
describe("Button validation", () => {
  // ERRORS
  it("should error when Button has no children and no aria-label", () => {
    const result = validateAccessibility({
      components: [{ name: "Button", props: { variant: "default" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "button-needs-name", severity: "error" })
    );
  });

  it("should error when Button has empty children", () => {
    const result = validateAccessibility({
      components: [{ name: "Button", props: {}, children: "" }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "button-needs-name", severity: "error" })
    );
  });

  it("should error when Button has whitespace-only children", () => {
    const result = validateAccessibility({
      components: [{ name: "Button", props: {}, children: "   " }],
    });
    expect(result.valid).toBe(false);
  });

  // PASSING
  it("should pass when Button has text children", () => {
    const result = validateAccessibility({
      components: [{ name: "Button", props: {}, children: "Submit" }],
    });
    expect(result.issues.filter((i) => i.rule === "button-needs-name")).toHaveLength(0);
  });

  it("should pass when Button has aria-label", () => {
    const result = validateAccessibility({
      components: [{ name: "Button", props: { "aria-label": "Close dialog" } }],
    });
    expect(result.issues.filter((i) => i.rule === "button-needs-name")).toHaveLength(0);
  });
});
```

### Modal Validation Tests

```typescript
describe("Modal validation", () => {
  // ERRORS
  it("should error when Modal.Content has no title or aria-label", () => {
    const result = validateAccessibility({
      components: [{ name: "Modal.Content", props: {} }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "modal-needs-label", severity: "error" })
    );
  });

  // WARNINGS
  it("should warn when Modal.Content has title but no description", () => {
    const result = validateAccessibility({
      components: [{ name: "Modal.Content", props: { title: "Confirm" } }],
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "modal-needs-description", severity: "warning" })
    );
  });

  // PASSING
  it("should pass when Modal.Content has title prop", () => {
    const result = validateAccessibility({
      components: [{ name: "Modal.Content", props: { title: "Confirm Action" } }],
    });
    expect(result.issues.filter((i) => i.rule === "modal-needs-label")).toHaveLength(0);
  });

  it("should pass when Modal.Content has aria-label", () => {
    const result = validateAccessibility({
      components: [{ name: "Modal.Content", props: { "aria-label": "Confirmation dialog" } }],
    });
    expect(result.issues.filter((i) => i.rule === "modal-needs-label")).toHaveLength(0);
  });

  it("should pass fully when Modal.Content has title and description", () => {
    const result = validateAccessibility({
      components: [
        {
          name: "Modal.Content",
          props: { title: "Confirm", description: "Are you sure?" },
        },
      ],
    });
    expect(result.issues.filter((i) => i.component === "Modal.Content")).toHaveLength(0);
  });
});
```

### Select Validation Tests

```typescript
describe("Select validation", () => {
  // ERRORS
  it("should error when Select has no label", () => {
    const result = validateAccessibility({
      components: [{ name: "Select", props: { placeholder: "Choose" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "select-needs-label", severity: "error" })
    );
  });

  // PASSING
  it("should pass when Select has aria-label", () => {
    const result = validateAccessibility({
      components: [{ name: "Select", props: { "aria-label": "Select country" } }],
    });
    expect(result.issues.filter((i) => i.rule === "select-needs-label")).toHaveLength(0);
  });
});
```

### Image Validation Tests

```typescript
describe("Image validation", () => {
  // ERRORS
  it("should error when img has no alt", () => {
    const result = validateAccessibility({
      components: [{ name: "img", props: { src: "/photo.jpg" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "img-needs-alt", severity: "error" })
    );
  });

  // WARNINGS
  it("should warn when alt contains 'image of'", () => {
    const result = validateAccessibility({
      components: [{ name: "img", props: { alt: "Image of a sunset" } }],
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "redundant-alt", severity: "warning" })
    );
  });

  // PASSING
  it("should pass when img has descriptive alt", () => {
    const result = validateAccessibility({
      components: [{ name: "img", props: { alt: "Golden sunset over mountains" } }],
    });
    expect(result.issues.filter((i) => i.rule === "img-needs-alt")).toHaveLength(0);
  });

  it("should pass when img has empty alt (decorative)", () => {
    const result = validateAccessibility({
      components: [{ name: "img", props: { alt: "" } }],
    });
    expect(result.issues.filter((i) => i.rule === "img-needs-alt")).toHaveLength(0);
  });
});
```

### Score Calculation Tests

```typescript
describe("Score calculation", () => {
  it("should return 100 for fully accessible components", () => {
    const result = validateAccessibility({
      components: [
        { name: "Button", props: {}, children: "Submit" },
        { name: "Input", props: { "aria-label": "Email" } },
      ],
    });
    expect(result.score).toBe(100);
    expect(result.valid).toBe(true);
  });

  it("should deduct 25 points per error", () => {
    const result = validateAccessibility({
      components: [
        { name: "Button", props: {} }, // error: -25
        { name: "Input", props: {} },  // error: -25
      ],
    });
    expect(result.score).toBe(50);
  });

  it("should deduct 10 points per warning", () => {
    const result = validateAccessibility({
      components: [
        { name: "Input", props: { id: "email", placeholder: "Email" } }, // warning: -10
      ],
    });
    expect(result.score).toBe(90);
    expect(result.valid).toBe(true); // warnings don't fail validation
  });

  it("should not go below 0", () => {
    const result = validateAccessibility({
      components: [
        { name: "Button", props: {} },
        { name: "Button", props: {} },
        { name: "Button", props: {} },
        { name: "Button", props: {} },
        { name: "Button", props: {} }, // 5 errors = -125, capped at 0
      ],
    });
    expect(result.score).toBe(0);
  });
});
```

### JSX Code Parsing Tests

```typescript
describe("JSX code parsing", () => {
  it("should parse self-closing components", () => {
    const result = validateAccessibility({
      code: '<Input type="email" />',
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "input-needs-label" })
    );
  });

  it("should parse components with children", () => {
    const result = validateAccessibility({
      code: "<Button>Submit</Button>",
    });
    expect(result.valid).toBe(true);
  });

  it("should parse nested components", () => {
    const result = validateAccessibility({
      code: `
        <Card>
          <CardContent>
            <Input placeholder="Name" />
            <Button>Save</Button>
          </CardContent>
        </Card>
      `,
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "input-needs-label" })
    );
  });

  it("should extract aria-label prop", () => {
    const result = validateAccessibility({
      code: '<Input aria-label="Your name" />',
    });
    expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(0);
  });
});
```

### Integration with compose_interface Output

```typescript
describe("Integration with compose_interface", () => {
  it("should validate compose_interface output", () => {
    // Simulate compose_interface output for "login form"
    const composeOutput = {
      components: [
        { name: "Card", props: {}, slot: "wrapper" },
        { name: "CardHeader", props: {}, slot: "header" },
        { name: "CardTitle", props: {}, slot: "header", children: "Sign In" },
        { name: "CardContent", props: {}, slot: "content" },
        { name: "Input", props: { type: "email", placeholder: "Email" }, slot: "content" },
        { name: "Input", props: { type: "password", placeholder: "Password" }, slot: "content" },
        { name: "CardFooter", props: {}, slot: "footer" },
        { name: "Button", props: { variant: "default" }, slot: "footer", children: "Sign In" },
      ],
    };

    const result = validateAccessibility({ components: composeOutput.components });

    // Should have errors for unlabeled inputs
    expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(2);
    expect(result.valid).toBe(false);
  });
});
```

### Context-Aware Validation Tests

```typescript
describe("Context-aware validation", () => {
  it("should apply form context rules", () => {
    const result = validateAccessibility({
      components: [
        { name: "Input", props: { id: "field1" } },
        { name: "Input", props: { id: "field2" } },
        { name: "Input", props: { id: "field3" } },
      ],
      context: "form",
    });
    // Should suggest fieldset for multiple form fields
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "form-needs-fieldset", severity: "info" })
    );
  });

  it("should apply modal context rules", () => {
    const result = validateAccessibility({
      components: [{ name: "Modal.Content", props: { title: "Confirm" } }],
      context: "modal",
    });
    // Modal context should emphasize description requirement
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: "modal-needs-description" })
    );
  });
});
```

### Summary Generation Tests

```typescript
describe("Summary generation", () => {
  it("should generate success summary", () => {
    const result = validateAccessibility({
      components: [{ name: "Button", props: {}, children: "Click" }],
    });
    expect(result.summary).toContain("passed");
    expect(result.summary).toContain("100");
  });

  it("should generate failure summary with issue count", () => {
    const result = validateAccessibility({
      components: [
        { name: "Button", props: {} },
        { name: "Input", props: {} },
      ],
    });
    expect(result.summary).toContain("2");
    expect(result.summary).toContain("error");
  });
});
```

---

## Server Registration

```typescript
// In server.ts
import {
  validateAccessibility,
  validateAccessibilityInputSchema,
  validateAccessibilityOutputSchema,
} from "./tools/validate-accessibility";

server.registerTool(
  "validate_accessibility",
  {
    title: "Validate Accessibility",
    description:
      "Validate JSX code or component array for WCAG 2.1 AA accessibility issues. Returns issues with severity, WCAG references, and fix suggestions.",
    inputSchema: validateAccessibilityInputSchema,
    outputSchema: validateAccessibilityOutputSchema,
  },
  async ({ code, components, context }) => {
    try {
      const output = validateAccessibility({ code, components, context });

      const issuesSummary = output.issues.length > 0
        ? output.issues.map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`).join("\n")
        : "No issues found.";

      return {
        content: [
          {
            type: "text",
            text: `Accessibility Score: ${output.score}/100\n\n${output.summary}\n\n${issuesSummary}`,
          },
        ],
        structuredContent: output,
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: error instanceof Error ? error.message : "Validation error",
          },
        ],
        isError: true,
      };
    }
  }
);
```

---

## File Structure

```
packages/mcp/src/tools/
├── validate-accessibility.ts       # Main implementation
├── validate-accessibility.test.ts  # Tests
└── validators/                     # Optional: split validators
    ├── input.ts
    ├── button.ts
    ├── modal.ts
    └── ...
```

---

## Usage Examples

### Validate compose_interface output

```typescript
const composed = composeInterface({ intent: "login form", context: "section" });
const validation = validateAccessibility({ components: composed.components });

if (!validation.valid) {
  console.log("Accessibility issues:", validation.issues);
}
```

### Validate raw JSX

```typescript
const validation = validateAccessibility({
  code: `
    <Card>
      <CardContent>
        <Input placeholder="Email" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  `,
});

console.log(`Score: ${validation.score}/100`);
```

### MCP tool query

```
Use validate_accessibility with code "<Button />" to check accessibility
```

---

## Implementation Order

1. Create schemas and types
2. Implement individual validators (Input, Button, Modal, Select, img)
3. Implement `parseJSXToComponents()` for code string support
4. Implement `calculateScore()` and summary generation
5. Implement main `validateAccessibility()` function
6. Write tests (run after each step)
7. Register in server.ts
8. Export from index.ts
