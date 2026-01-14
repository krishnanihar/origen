import { z } from "zod";

// ============ INPUT SCHEMA ============

export const validateAccessibilityInputSchema = {
  code: z.string().optional().describe("JSX code string to validate"),
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
    .describe("Context hint for validation"),
};

// ============ OUTPUT SCHEMA ============

export const validateAccessibilityOutputSchema = {
  valid: z.boolean().describe("True if no errors"),
  score: z.number().min(0).max(100).describe("Accessibility score"),
  issues: z.array(
    z.object({
      severity: z.enum(["error", "warning", "info"]),
      rule: z.string(),
      wcag: z.string().optional(),
      component: z.string().optional(),
      message: z.string(),
      suggestion: z.string(),
    })
  ),
  summary: z.string(),
  passedRules: z.array(z.string()),
};

// ============ TYPES ============

export type Severity = "error" | "warning" | "info";

export type ComponentInput = {
  name: string;
  props: Record<string, unknown>;
  children?: string | unknown[];
  slot?: string;
};

export type ValidateAccessibilityInput = {
  code?: string;
  components?: ComponentInput[];
  context?: "form" | "navigation" | "content" | "modal" | "general";
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

// ============ JSX PARSER ============

function parseJSXToComponents(code: string): ComponentInput[] {
  const components: ComponentInput[] = [];

  // Match self-closing tags: <ComponentName prop="value" />
  const selfClosingRegex = /<(\w+(?:\.\w+)?)\s*([^>]*?)\/>/g;
  let match;

  while ((match = selfClosingRegex.exec(code)) !== null) {
    const name = match[1];
    const propsStr = match[2];
    const props = parseProps(propsStr);
    components.push({ name, props });
  }

  // Match opening tags with children: <ComponentName>children</ComponentName>
  const openingRegex = /<(\w+(?:\.\w+)?)\s*([^>]*)>([^<]*)<\/\1>/g;

  while ((match = openingRegex.exec(code)) !== null) {
    const name = match[1];
    const propsStr = match[2];
    const children = match[3].trim();
    const props = parseProps(propsStr);
    components.push({ name, props, children: children || undefined });
  }

  return components;
}

function parseProps(propsStr: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  // Match key="value" patterns
  const stringPropRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
  let match;

  while ((match = stringPropRegex.exec(propsStr)) !== null) {
    props[match[1]] = match[2];
  }

  // Match key={value} patterns (simple cases)
  const exprPropRegex = /(\w+(?:-\w+)*)=\{([^}]+)\}/g;

  while ((match = exprPropRegex.exec(propsStr)) !== null) {
    const key = match[1];
    const value = match[2].trim();
    if (value === "true") props[key] = true;
    else if (value === "false") props[key] = false;
    else if (!isNaN(Number(value))) props[key] = Number(value);
    else props[key] = value;
  }

  return props;
}

// ============ VALIDATORS ============

function validateInput(component: ComponentInput): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const { props } = component;

  const hasAriaLabel = !!props["aria-label"];
  const hasAriaLabelledBy = !!props["aria-labelledby"];
  const hasId = !!props.id;
  const hasPlaceholder = !!props.placeholder;

  // Error: No accessible label at all
  if (!hasAriaLabel && !hasAriaLabelledBy && !hasId) {
    issues.push({
      severity: "error",
      rule: "input-needs-label",
      wcag: "1.3.1, 4.1.2",
      component: "Input",
      message: "Input is missing an accessible label",
      suggestion:
        "Add aria-label, aria-labelledby, or associate with a Label using id",
    });
  }

  // Warning: Only placeholder, no real label
  if (hasPlaceholder && !hasAriaLabel && !hasAriaLabelledBy && hasId) {
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
  const hasTextContent =
    typeof children === "string" && children.trim().length > 0;

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
      suggestion:
        "Add title prop or aria-label/aria-labelledby to Modal.Content",
    });
  }

  // Warning: No description (only if has label)
  if (
    (hasTitle || hasAriaLabel || hasAriaLabelledBy) &&
    !hasDescription &&
    !hasAriaDescribedBy
  ) {
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

function validateSelect(component: ComponentInput): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const { props } = component;

  const hasAriaLabel = !!props["aria-label"];
  const hasAriaLabelledBy = !!props["aria-labelledby"];
  const hasId = !!props.id;

  // Error: No accessible label
  if (!hasAriaLabel && !hasAriaLabelledBy && !hasId) {
    issues.push({
      severity: "error",
      rule: "select-needs-label",
      wcag: "1.3.1, 4.1.2",
      component: "Select",
      message: "Select is missing an accessible label",
      suggestion: "Add aria-label or associate with a Label element",
    });
  }

  return issues;
}

function validateImage(component: ComponentInput): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const { props } = component;

  const alt = props.alt;
  const hasAlt = alt !== undefined;

  // Error: Missing alt
  if (!hasAlt) {
    issues.push({
      severity: "error",
      rule: "img-needs-alt",
      wcag: "1.1.1",
      component: "img",
      message: "Image is missing alt text",
      suggestion:
        "Add alt attribute with descriptive text, or alt='' for decorative images",
    });
  }

  // Warning: Redundant alt text
  if (hasAlt && typeof alt === "string" && alt.length > 0) {
    const lowerAlt = alt.toLowerCase();
    if (
      lowerAlt.includes("image of") ||
      lowerAlt.includes("picture of") ||
      lowerAlt.includes("photo of")
    ) {
      issues.push({
        severity: "warning",
        rule: "redundant-alt",
        wcag: "1.1.1",
        component: "img",
        message: "Alt text contains redundant words",
        suggestion: "Remove 'image of' prefix; screen readers announce images",
      });
    }
  }

  return issues;
}

function validateComponent(component: ComponentInput): AccessibilityIssue[] {
  switch (component.name) {
    case "Input":
      return validateInput(component);
    case "Button":
      return validateButton(component);
    case "Modal.Content":
      return validateModal(component);
    case "Select":
      return validateSelect(component);
    case "img":
      return validateImage(component);
    default:
      return [];
  }
}

// ============ SCORE CALCULATION ============

function calculateScore(issues: AccessibilityIssue[]): number {
  const weights: Record<Severity, number> = {
    error: 25,
    warning: 10,
    info: 2,
  };

  let score = 100;

  for (const issue of issues) {
    score -= weights[issue.severity];
  }

  return Math.max(0, score);
}

// ============ SUMMARY GENERATION ============

function generateSummary(
  issues: AccessibilityIssue[],
  score: number
): string {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  if (issues.length === 0) {
    return "All accessibility checks passed. Score: 100/100";
  }

  const parts: string[] = [];
  if (errorCount > 0) {
    parts.push(`${errorCount} error${errorCount > 1 ? "s" : ""}`);
  }
  if (warningCount > 0) {
    parts.push(`${warningCount} warning${warningCount > 1 ? "s" : ""}`);
  }

  return `Found ${parts.join(" and ")}. Score: ${score}/100`;
}

// ============ PASSED RULES TRACKING ============

function getPassedRules(
  components: ComponentInput[],
  issues: AccessibilityIssue[]
): string[] {
  const passedRules: string[] = [];
  const failedRules = new Set(issues.map((i) => i.rule));

  // Check each component type for passed rules
  for (const component of components) {
    switch (component.name) {
      case "Button":
        if (!failedRules.has("button-needs-name")) {
          if (!passedRules.includes("button-needs-name")) {
            passedRules.push("button-needs-name");
          }
        }
        break;
      case "Input":
        if (!failedRules.has("input-needs-label")) {
          if (!passedRules.includes("input-needs-label")) {
            passedRules.push("input-needs-label");
          }
        }
        break;
      case "Modal.Content":
        if (!failedRules.has("modal-needs-label")) {
          if (!passedRules.includes("modal-needs-label")) {
            passedRules.push("modal-needs-label");
          }
        }
        break;
      case "Select":
        if (!failedRules.has("select-needs-label")) {
          if (!passedRules.includes("select-needs-label")) {
            passedRules.push("select-needs-label");
          }
        }
        break;
      case "img":
        if (!failedRules.has("img-needs-alt")) {
          if (!passedRules.includes("img-needs-alt")) {
            passedRules.push("img-needs-alt");
          }
        }
        break;
    }
  }

  return passedRules;
}

// ============ MAIN FUNCTION ============

export function validateAccessibility(
  input: ValidateAccessibilityInput
): ValidateAccessibilityOutput {
  const { code, components: inputComponents } = input;

  // Validate input
  if (!code && !inputComponents) {
    throw new Error("Either code or components must be provided");
  }

  // Get components (prefer inputComponents over parsing code)
  let components: ComponentInput[];
  if (inputComponents) {
    components = inputComponents;
  } else {
    components = parseJSXToComponents(code!);
  }

  // Validate all components
  const issues: AccessibilityIssue[] = [];
  for (const component of components) {
    issues.push(...validateComponent(component));
  }

  // Calculate score
  const score = calculateScore(issues);

  // Check if valid (no errors)
  const valid = issues.filter((i) => i.severity === "error").length === 0;

  // Generate summary
  const summary = generateSummary(issues, score);

  // Get passed rules
  const passedRules = getPassedRules(components, issues);

  return {
    valid,
    score,
    issues,
    summary,
    passedRules,
  };
}
