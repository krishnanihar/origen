import { z } from "zod";

// ============ INPUT SCHEMA ============

export const composeInterfaceInputSchema = {
  intent: z
    .string()
    .describe(
      "Natural language description of the interface to create (e.g., 'login form', 'user profile card')"
    ),
  context: z
    .enum(["page", "section", "component"])
    .default("section")
    .describe(
      "Scope of the interface: full page, section within a page, or single component"
    ),
};

// ============ OUTPUT SCHEMA ============

export const composeInterfaceOutputSchema = {
  layout: z.object({
    type: z.enum(["flex", "grid", "stack"]),
    direction: z.enum(["row", "column"]).optional(),
    gap: z.string().optional(),
  }),
  components: z.array(
    z.object({
      name: z.string(),
      props: z.record(z.any()),
      slot: z
        .enum(["header", "content", "footer", "trigger", "wrapper"])
        .optional(),
      children: z.string().optional(),
    })
  ),
  code: z.string().describe("Generated JSX code snippet"),
  tokens: z.array(z.string()).describe("Design tokens referenced"),
  suggestions: z.array(z.string()).optional(),
};

// ============ TYPES ============

export type ComposeInterfaceInput = {
  intent: string;
  context: "page" | "section" | "component";
};

export type LayoutConfig = {
  type: "flex" | "grid" | "stack";
  direction?: "row" | "column";
  gap?: string;
};

export type ComponentDefinition = {
  name: string;
  props: Record<string, unknown>;
  slot?: "header" | "content" | "footer" | "trigger" | "wrapper";
  children?: string;
};

export type ComposeInterfaceOutput = {
  layout: LayoutConfig;
  components: ComponentDefinition[];
  code: string;
  tokens: string[];
  suggestions?: string[];
};

export type IntentPattern = {
  keywords: string[];
  components: ComponentDefinition[];
  layout: LayoutConfig;
};

// ============ INTENT PATTERNS ============

const intentPatterns: IntentPattern[] = [
  // Authentication patterns
  {
    keywords: ["login", "signin", "sign in", "log in"],
    components: [
      { name: "Card", props: {}, slot: "wrapper" },
      { name: "CardHeader", props: {}, slot: "header" },
      { name: "CardTitle", props: {}, slot: "header", children: "Sign In" },
      { name: "CardContent", props: {}, slot: "content" },
      {
        name: "Input",
        props: { type: "email", placeholder: "Email" },
        slot: "content",
      },
      {
        name: "Input",
        props: { type: "password", placeholder: "Password" },
        slot: "content",
      },
      { name: "CardFooter", props: {}, slot: "footer" },
      {
        name: "Button",
        props: { variant: "default" },
        slot: "footer",
        children: "Sign In",
      },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // User profile patterns
  {
    keywords: ["profile", "user card", "user profile", "account"],
    components: [
      { name: "Card", props: {}, slot: "wrapper" },
      { name: "CardHeader", props: {}, slot: "header" },
      { name: "CardTitle", props: {}, slot: "header", children: "User Profile" },
      {
        name: "CardDescription",
        props: {},
        slot: "header",
        children: "Manage your account",
      },
      { name: "CardContent", props: {}, slot: "content" },
      {
        name: "Button",
        props: { variant: "secondary" },
        slot: "content",
        children: "Edit Profile",
      },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // Form patterns
  {
    keywords: ["form", "input form", "data entry"],
    components: [
      { name: "Card", props: {}, slot: "wrapper" },
      { name: "CardHeader", props: {}, slot: "header" },
      { name: "CardTitle", props: {}, slot: "header", children: "Form" },
      { name: "CardContent", props: {}, slot: "content" },
      { name: "CardFooter", props: {}, slot: "footer" },
      {
        name: "Button",
        props: { variant: "default" },
        slot: "footer",
        children: "Submit",
      },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // Navigation patterns
  {
    keywords: ["navigation", "header", "navbar", "nav"],
    components: [
      {
        name: "Button",
        props: { variant: "ghost" },
        children: "Home",
      },
      {
        name: "Button",
        props: { variant: "ghost" },
        children: "About",
      },
      {
        name: "Button",
        props: { variant: "ghost" },
        children: "Contact",
      },
    ],
    layout: { type: "flex", direction: "row", gap: "2" },
  },

  // Settings patterns
  {
    keywords: ["settings", "preferences", "options"],
    components: [
      { name: "Card", props: {}, slot: "wrapper" },
      { name: "CardHeader", props: {}, slot: "header" },
      { name: "CardTitle", props: {}, slot: "header", children: "Settings" },
      { name: "CardContent", props: {}, slot: "content" },
      { name: "Select", props: { placeholder: "Choose option" }, slot: "content" },
      { name: "CardFooter", props: {}, slot: "footer" },
      {
        name: "Button",
        props: { variant: "default" },
        slot: "footer",
        children: "Save",
      },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },

  // Modal/dialog patterns
  {
    keywords: ["modal", "dialog", "popup", "confirm"],
    components: [
      { name: "Modal", props: {}, slot: "wrapper" },
      { name: "Button", props: {}, slot: "trigger", children: "Open" },
    ],
    layout: { type: "stack", direction: "column", gap: "4" },
  },
];

// ============ HELPER FUNCTIONS ============

export function matchIntent(intent: string): IntentPattern | null {
  const normalized = intent.toLowerCase();

  // Score each pattern by keyword matches
  const scored = intentPatterns.map((pattern) => ({
    pattern,
    score: pattern.keywords.filter((kw) => normalized.includes(kw)).length,
  }));

  // Sort by score descending and return highest scoring pattern with score > 0
  const best = scored.sort((a, b) => b.score - a.score)[0];
  return best && best.score > 0 ? best.pattern : null;
}

export function extractFormFields(intent: string): string[] {
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

type SlottedComponents = {
  wrapper: ComponentDefinition[];
  header: ComponentDefinition[];
  content: ComponentDefinition[];
  footer: ComponentDefinition[];
  trigger: ComponentDefinition[];
  unslotted: ComponentDefinition[];
};

function groupBySlot(components: ComponentDefinition[]): SlottedComponents {
  const slotted: SlottedComponents = {
    wrapper: [],
    header: [],
    content: [],
    footer: [],
    trigger: [],
    unslotted: [],
  };

  for (const comp of components) {
    if (comp.slot && comp.slot in slotted) {
      slotted[comp.slot].push(comp);
    } else {
      slotted.unslotted.push(comp);
    }
  }

  return slotted;
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

function generateCardStructure(slotted: SlottedComponents, indent: string): string {
  let code = `<Card>\n`;

  // Header section
  if (slotted.header.length > 0) {
    code += `${indent}<CardHeader>\n`;
    for (const comp of slotted.header) {
      if (comp.name !== "CardHeader") {
        code += `${indent}${indent}${renderComponent(comp)}\n`;
      }
    }
    code += `${indent}</CardHeader>\n`;
  }

  // Content section
  if (slotted.content.length > 0) {
    code += `${indent}<CardContent className="flex flex-col gap-4">\n`;
    for (const comp of slotted.content) {
      if (comp.name !== "CardContent") {
        code += `${indent}${indent}${renderComponent(comp)}\n`;
      }
    }
    code += `${indent}</CardContent>\n`;
  }

  // Footer section
  if (slotted.footer.length > 0) {
    code += `${indent}<CardFooter>\n`;
    for (const comp of slotted.footer) {
      if (comp.name !== "CardFooter") {
        code += `${indent}${indent}${renderComponent(comp)}\n`;
      }
    }
    code += `${indent}</CardFooter>\n`;
  }

  code += `</Card>`;
  return code;
}

function generateFlatLayout(
  components: ComponentDefinition[],
  layout: LayoutConfig,
  indent: string
): string {
  const dirClass = layout.direction === "row" ? "flex-row" : "flex-col";
  const gapClass = layout.gap ? `gap-${layout.gap}` : "";
  const layoutClass = layout.type === "flex" ? `flex ${dirClass} ${gapClass}` : "";

  let code = `<div className="${layoutClass.trim()}">\n`;
  for (const comp of components) {
    code += `${indent}${renderComponent(comp)}\n`;
  }
  code += `</div>`;
  return code;
}

export function generateCode(
  layout: LayoutConfig,
  components: ComponentDefinition[],
  context: "page" | "section" | "component"
): string {
  const indent = "  ";
  const slotted = groupBySlot(components);

  let code = "";

  // Page wrapper
  if (context === "page") {
    code += `<div className="min-h-screen bg-background p-8">\n${indent}`;
  }

  // Check if this is a Card-based layout
  const hasCard = slotted.wrapper.some((c) => c.name === "Card");
  const hasModal = slotted.wrapper.some((c) => c.name === "Modal");

  if (hasCard) {
    const cardCode = generateCardStructure(slotted, indent);
    if (context === "page") {
      code += cardCode.split("\n").join(`\n${indent}`);
    } else {
      code += cardCode;
    }
  } else if (hasModal) {
    code += `<Modal>\n`;
    if (slotted.trigger.length > 0) {
      code += `${indent}<Modal.Trigger>\n`;
      for (const comp of slotted.trigger) {
        if (comp.name !== "Modal") {
          code += `${indent}${indent}${renderComponent(comp)}\n`;
        }
      }
      code += `${indent}</Modal.Trigger>\n`;
    }
    code += `${indent}<Modal.Content title="Modal">\n`;
    code += `${indent}${indent}{/* Content here */}\n`;
    code += `${indent}</Modal.Content>\n`;
    code += `</Modal>`;
  } else {
    // Flat layout (e.g., navigation)
    const flatCode = generateFlatLayout(
      [...slotted.unslotted, ...components.filter((c) => !c.slot)],
      layout,
      indent
    );
    if (context === "page") {
      code += flatCode.split("\n").join(`\n${indent}`);
    } else {
      code += flatCode;
    }
  }

  // Close page wrapper
  if (context === "page") {
    code += `\n</div>`;
  }

  return code;
}

export function collectTokens(
  components: Array<{ name: string; props: Record<string, unknown> }>
): string[] {
  const tokenMap: Record<string, string[]> = {
    Button: ["primary", "primary-foreground", "secondary", "destructive"],
    Input: ["background", "border", "input", "ring", "foreground"],
    Card: ["card", "card-foreground", "border"],
    CardHeader: ["card"],
    CardTitle: ["card-foreground"],
    CardDescription: ["muted-foreground"],
    CardContent: ["card"],
    CardFooter: ["card", "border"],
    Select: ["background", "border", "foreground"],
    Modal: ["background", "foreground", "border"],
  };

  const tokens = new Set<string>();
  for (const comp of components) {
    const compTokens = tokenMap[comp.name] || [];
    compTokens.forEach((t) => tokens.add(t));
  }

  return Array.from(tokens).sort();
}

function buildComponentList(
  pattern: IntentPattern,
  intent: string
): ComponentDefinition[] {
  // Start with pattern components
  const components = [...pattern.components];

  // Check if this is a form pattern - add dynamic fields
  const isFormPattern = pattern.keywords.some((kw) =>
    ["form", "data entry"].includes(kw)
  );

  if (isFormPattern) {
    const fields = extractFormFields(intent);
    const contentIndex = components.findIndex(
      (c) => c.name === "CardContent" && c.slot === "content"
    );

    // Insert dynamic inputs after CardContent
    const insertIndex = contentIndex !== -1 ? contentIndex + 1 : components.length - 2;

    const dynamicInputs: ComponentDefinition[] = fields.map((field) => ({
      name: "Input",
      props: {
        type: field === "textarea" ? "text" : field,
        placeholder: field.charAt(0).toUpperCase() + field.slice(1),
      },
      slot: "content" as const,
    }));

    components.splice(insertIndex, 0, ...dynamicInputs);
  }

  return components;
}

export function composeInterface(
  input: ComposeInterfaceInput
): ComposeInterfaceOutput {
  const { intent, context } = input;

  // Validate intent
  if (!intent.trim()) {
    throw new Error("Intent cannot be empty");
  }

  // Match intent to pattern
  const pattern = matchIntent(intent);

  // Handle unknown intents
  if (!pattern) {
    return {
      layout: { type: "stack", direction: "column" },
      components: [],
      code: "// No matching pattern found for this intent",
      tokens: [],
      suggestions: [
        "login form",
        "user profile",
        "contact form",
        "navigation header",
        "settings page",
      ],
    };
  }

  // Build component list with dynamic fields
  const components = buildComponentList(pattern, intent);

  // Generate code
  const code = generateCode(pattern.layout, components, context);

  // Collect tokens
  const tokens = collectTokens(components);

  return {
    layout: pattern.layout,
    components,
    code,
    tokens,
  };
}
