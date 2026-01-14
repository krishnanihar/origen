import { z } from "zod";

// ============ INPUT SCHEMA ============

export const getLayoutPatternInputSchema = {
  pattern: z
    .enum([
      "form-layout",
      "split-view",
      "dashboard-grid",
      "modal-confirm",
      "list-with-actions",
      "hero-section",
      "empty-state",
    ])
    .describe("Layout pattern to retrieve"),
  options: z
    .object({
      title: z.string().optional().describe("Title text for the layout"),
      description: z.string().optional().describe("Description/subtitle text"),
      columns: z
        .number()
        .min(1)
        .max(6)
        .optional()
        .describe("Number of columns for grid layouts"),
      primaryAction: z.string().optional().describe("Primary button label"),
      secondaryAction: z.string().optional().describe("Secondary button label"),
      variant: z
        .enum(["default", "destructive"])
        .optional()
        .describe("Action variant for modals"),
    })
    .optional()
    .describe("Customization options for the pattern"),
};

// ============ OUTPUT SCHEMA ============

export const getLayoutPatternOutputSchema = {
  pattern: z.string().describe("Pattern name"),
  structure: z.object({
    type: z.enum(["flex", "grid", "stack"]),
    direction: z.enum(["row", "column"]).optional(),
    gap: z.string().optional(),
    columns: z.number().optional(),
  }),
  components: z.array(
    z.object({
      name: z.string(),
      props: z.record(z.any()),
      slot: z.string().optional(),
      children: z.union([z.string(), z.array(z.any())]).optional(),
    })
  ),
  code: z.string().describe("Generated JSX code"),
  tokens: z.array(z.string()).describe("Design tokens used"),
  slots: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        accepts: z.array(z.string()),
      })
    )
    .describe("Customization points in the layout"),
  usage: z.object({
    when: z.array(z.string()),
    examples: z.array(z.string()),
  }),
};

// ============ TYPES ============

export type PatternName =
  | "form-layout"
  | "split-view"
  | "dashboard-grid"
  | "modal-confirm"
  | "list-with-actions"
  | "hero-section"
  | "empty-state";

export type GetLayoutPatternInput = {
  pattern: PatternName;
  options?: {
    title?: string;
    description?: string;
    columns?: number;
    primaryAction?: string;
    secondaryAction?: string;
    variant?: "default" | "destructive";
  };
};

export type LayoutStructure = {
  type: "flex" | "grid" | "stack";
  direction?: "row" | "column";
  gap?: string;
  columns?: number;
};

export type ComponentDef = {
  name: string;
  props: Record<string, unknown>;
  slot?: string;
  children?: string | unknown[];
};

export type SlotDef = {
  name: string;
  description: string;
  accepts: string[];
};

export type UsageDef = {
  when: string[];
  examples: string[];
};

export type GetLayoutPatternOutput = {
  pattern: string;
  structure: LayoutStructure;
  components: ComponentDef[];
  code: string;
  tokens: string[];
  slots: SlotDef[];
  usage: UsageDef;
};

type PatternConfig = {
  structure: LayoutStructure;
  components: ComponentDef[];
  slots: SlotDef[];
  usage: UsageDef;
  tokens: string[];
  generateCode: (options: GetLayoutPatternInput["options"]) => string;
};

// ============ PATTERN DEFINITIONS ============

const patterns: Record<PatternName, PatternConfig> = {
  "form-layout": {
    structure: {
      type: "stack",
      direction: "column",
      gap: "6",
    },
    components: [
      { name: "Card", props: {}, slot: "wrapper" },
      { name: "CardHeader", props: {}, slot: "header" },
      { name: "CardTitle", props: {}, slot: "header" },
      { name: "CardDescription", props: {}, slot: "header" },
      { name: "CardContent", props: { className: "space-y-4" }, slot: "content" },
      { name: "Input", props: {}, slot: "content" },
      { name: "CardFooter", props: { className: "flex justify-end gap-2" }, slot: "footer" },
      { name: "Button", props: { variant: "outline" }, slot: "footer" },
      { name: "Button", props: { variant: "default" }, slot: "footer" },
    ],
    slots: [
      { name: "fields", description: "Form field area", accepts: ["Input", "Select", "FormField"] },
      { name: "actions", description: "Footer action buttons", accepts: ["Button"] },
    ],
    usage: {
      when: ["Collecting user input", "Data entry forms", "Settings forms"],
      examples: ["Contact form", "Profile edit", "Checkout form"],
    },
    tokens: ["border", "card", "card-foreground", "muted-foreground", "primary", "primary-foreground"],
    generateCode: (options) => {
      const title = options?.title ?? "Form Title";
      const description = options?.description ?? "Enter your information below";
      const primaryAction = options?.primaryAction ?? "Submit";
      const secondaryAction = options?.secondaryAction ?? "Cancel";

      return `<Card>
  <CardHeader>
    <CardTitle>${title}</CardTitle>
    <CardDescription>${description}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="field1">Field 1</Label>
      <Input id="field1" placeholder="Enter value" />
    </div>
    {/* Add more fields here */}
  </CardContent>
  <CardFooter>
    <div className="flex justify-end gap-2 w-full">
      <Button variant="outline">${secondaryAction}</Button>
      <Button>${primaryAction}</Button>
    </div>
  </CardFooter>
</Card>`;
    },
  },

  "split-view": {
    structure: {
      type: "grid",
      columns: 2,
      gap: "0",
    },
    components: [
      { name: "div", props: { className: "grid grid-cols-[250px_1fr] min-h-screen" }, slot: "wrapper" },
      { name: "aside", props: { className: "border-r border-border bg-muted/30 p-4" }, slot: "sidebar" },
      { name: "nav", props: { className: "space-y-2" }, slot: "sidebar" },
      { name: "Button", props: { variant: "ghost", className: "w-full justify-start" }, slot: "sidebar" },
      { name: "main", props: { className: "p-6" }, slot: "main" },
    ],
    slots: [
      { name: "sidebar", description: "Navigation sidebar", accepts: ["Button", "nav"] },
      { name: "main", description: "Main content area", accepts: ["Card", "div", "section"] },
    ],
    usage: {
      when: ["Admin dashboards", "Settings pages", "Documentation sites"],
      examples: ["App settings", "User management", "Content editor"],
    },
    tokens: ["background", "border", "foreground", "muted"],
    generateCode: (options) => {
      const title = options?.title ?? "Dashboard";

      return `<div className="grid grid-cols-[250px_1fr] min-h-screen">
  <aside className="border-r border-border bg-muted/30 p-4">
    <nav className="space-y-2">
      <Button variant="ghost" className="w-full justify-start">${title}</Button>
      <Button variant="ghost" className="w-full justify-start">Settings</Button>
      <Button variant="ghost" className="w-full justify-start">Profile</Button>
    </nav>
  </aside>
  <main className="p-6">
    {/* Main content here */}
  </main>
</div>`;
    },
  },

  "dashboard-grid": {
    structure: {
      type: "grid",
      columns: 3,
      gap: "4",
    },
    components: [
      { name: "div", props: { className: "space-y-6" }, slot: "wrapper" },
      { name: "div", props: { className: "grid gap-4" }, slot: "stats" },
      { name: "Card", props: {}, slot: "stats" },
      { name: "CardHeader", props: { className: "pb-2" }, slot: "stats" },
      { name: "CardTitle", props: { className: "text-sm font-medium" }, slot: "stats" },
      { name: "CardContent", props: {}, slot: "stats" },
    ],
    slots: [
      { name: "stats", description: "Stat card grid", accepts: ["Card"] },
      { name: "main", description: "Main content area below stats", accepts: ["Card", "div"] },
    ],
    usage: {
      when: ["Analytics dashboards", "Admin overviews", "Metrics displays"],
      examples: ["Sales dashboard", "User analytics", "System status"],
    },
    tokens: ["border", "card", "card-foreground", "muted-foreground"],
    generateCode: (options) => {
      const columns = options?.columns ?? 3;

      return `<div className="space-y-6">
  <div className="grid grid-cols-${columns} gap-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">1,234</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$12,345</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">42</div>
      </CardContent>
    </Card>
  </div>
  <Card className="col-span-full">
    {/* Main content here */}
  </Card>
</div>`;
    },
  },

  "modal-confirm": {
    structure: {
      type: "stack",
      direction: "column",
      gap: "4",
    },
    components: [
      { name: "Modal", props: {}, slot: "wrapper" },
      { name: "Modal.Trigger", props: {}, slot: "trigger" },
      { name: "Button", props: { variant: "outline" }, slot: "trigger" },
      { name: "Modal.Content", props: {}, slot: "content" },
      { name: "Button", props: { variant: "outline" }, slot: "actions" },
      { name: "Button", props: {}, slot: "actions" },
    ],
    slots: [
      { name: "trigger", description: "Element that opens the modal", accepts: ["Button"] },
      { name: "content", description: "Modal body content", accepts: ["div", "p", "form"] },
      { name: "actions", description: "Action buttons", accepts: ["Button"] },
    ],
    usage: {
      when: ["Destructive actions", "Confirmations", "Important decisions"],
      examples: ["Delete confirmation", "Logout prompt", "Discard changes"],
    },
    tokens: ["background", "border", "card", "foreground", "muted-foreground", "primary", "destructive"],
    generateCode: (options) => {
      const title = options?.title ?? "Confirm Action";
      const description = options?.description ?? "Are you sure you want to proceed?";
      const primaryAction = options?.primaryAction ?? "Confirm";
      const secondaryAction = options?.secondaryAction ?? "Cancel";
      const variant = options?.variant ?? "default";
      const primaryButton =
        variant === "destructive"
          ? `<Button variant="destructive">${primaryAction}</Button>`
          : `<Button>${primaryAction}</Button>`;

      return `<Modal>
  <Modal.Trigger>
    <Button variant="outline">Open</Button>
  </Modal.Trigger>
  <Modal.Content title="${title}" description="${description}">
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline">${secondaryAction}</Button>
      ${primaryButton}
    </div>
  </Modal.Content>
</Modal>`;
    },
  },

  "list-with-actions": {
    structure: {
      type: "stack",
      direction: "column",
      gap: "0",
    },
    components: [
      { name: "Card", props: {}, slot: "wrapper" },
      { name: "CardHeader", props: {}, slot: "header" },
      { name: "CardTitle", props: {}, slot: "header" },
      { name: "CardDescription", props: {}, slot: "header" },
      { name: "CardContent", props: { className: "p-0" }, slot: "content" },
      { name: "div", props: { className: "divide-y divide-border" }, slot: "items" },
      { name: "Button", props: { variant: "ghost", size: "sm" }, slot: "actions" },
      { name: "CardFooter", props: { className: "justify-center" }, slot: "footer" },
    ],
    slots: [
      { name: "items", description: "List items", accepts: ["div", "ListItem"] },
      { name: "actions", description: "Per-item actions", accepts: ["Button"] },
      { name: "pagination", description: "Pagination controls", accepts: ["Button", "Pagination"] },
    ],
    usage: {
      when: ["Data lists", "User management", "Content management"],
      examples: ["User list", "Product inventory", "Task list"],
    },
    tokens: ["border", "card", "card-foreground", "muted-foreground", "primary"],
    generateCode: (options) => {
      const title = options?.title ?? "Items";
      const description = options?.description ?? "Manage your items";

      return `<Card>
  <CardHeader>
    <CardTitle>${title}</CardTitle>
    <CardDescription>${description}</CardDescription>
  </CardHeader>
  <CardContent className="p-0">
    <div className="divide-y divide-border">
      <div className="flex items-center justify-between p-4">
        <div>Item 1</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">Delete</Button>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div>Item 2</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">Delete</Button>
        </div>
      </div>
    </div>
  </CardContent>
  <CardFooter className="justify-center">
    <Button variant="outline">Load More</Button>
  </CardFooter>
</Card>`;
    },
  },

  "hero-section": {
    structure: {
      type: "flex",
      direction: "column",
      gap: "6",
    },
    components: [
      { name: "section", props: { className: "flex flex-col items-center justify-center min-h-[60vh] text-center px-4" }, slot: "wrapper" },
      { name: "h1", props: { className: "text-4xl font-bold tracking-tight sm:text-6xl" }, slot: "headline" },
      { name: "p", props: { className: "mt-6 text-lg text-muted-foreground max-w-2xl" }, slot: "description" },
      { name: "div", props: { className: "mt-10 flex items-center justify-center gap-4" }, slot: "actions" },
      { name: "Button", props: { size: "lg" }, slot: "actions" },
      { name: "Button", props: { variant: "outline", size: "lg" }, slot: "actions" },
    ],
    slots: [
      { name: "headline", description: "Main headline", accepts: ["h1", "span"] },
      { name: "description", description: "Supporting text", accepts: ["p", "span"] },
      { name: "actions", description: "CTA buttons", accepts: ["Button"] },
    ],
    usage: {
      when: ["Landing pages", "Marketing pages", "Product launches"],
      examples: ["Homepage hero", "Feature announcement", "Waitlist signup"],
    },
    tokens: ["background", "foreground", "muted-foreground", "primary", "primary-foreground"],
    generateCode: (options) => {
      const title = options?.title ?? "Welcome to Our App";
      const description = options?.description ?? "Build amazing things with our powerful tools and intuitive interface.";
      const primaryAction = options?.primaryAction ?? "Get Started";
      const secondaryAction = options?.secondaryAction ?? "Learn More";

      return `<section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
    ${title}
  </h1>
  <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
    ${description}
  </p>
  <div className="mt-10 flex items-center justify-center gap-4">
    <Button size="lg">${primaryAction}</Button>
    <Button variant="outline" size="lg">${secondaryAction}</Button>
  </div>
</section>`;
    },
  },

  "empty-state": {
    structure: {
      type: "flex",
      direction: "column",
      gap: "4",
    },
    components: [
      { name: "div", props: { className: "flex flex-col items-center justify-center py-12 text-center" }, slot: "wrapper" },
      { name: "div", props: { className: "rounded-full bg-muted p-4 mb-4" }, slot: "icon" },
      { name: "h3", props: { className: "text-lg font-semibold" }, slot: "message" },
      { name: "p", props: { className: "text-sm text-muted-foreground max-w-sm mt-2" }, slot: "message" },
      { name: "div", props: { className: "mt-6" }, slot: "actions" },
      { name: "Button", props: {}, slot: "actions" },
    ],
    slots: [
      { name: "icon", description: "Illustration or icon", accepts: ["svg", "img", "div"] },
      { name: "message", description: "Empty state message", accepts: ["h3", "p"] },
      { name: "actions", description: "Action to resolve empty state", accepts: ["Button"] },
    ],
    usage: {
      when: ["No data to display", "First-time user experience", "Search with no results"],
      examples: ["Empty inbox", "No search results", "No projects yet"],
    },
    tokens: ["background", "foreground", "muted", "muted-foreground", "primary"],
    generateCode: (options) => {
      const title = options?.title ?? "No items yet";
      const description = options?.description ?? "Get started by creating your first item.";
      const primaryAction = options?.primaryAction ?? "Create Item";

      return `<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="rounded-full bg-muted p-4 mb-4">
    <InboxIcon className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold">${title}</h3>
  <p className="text-sm text-muted-foreground max-w-sm mt-2">
    ${description}
  </p>
  <div className="mt-6">
    <Button>${primaryAction}</Button>
  </div>
</div>`;
    },
  },
};

// ============ MAIN FUNCTION ============

export function getLayoutPattern(input: GetLayoutPatternInput): GetLayoutPatternOutput {
  const { pattern, options } = input;

  // Validate pattern
  if (!patterns[pattern]) {
    throw new Error(`Invalid pattern: "${pattern}". Available patterns: ${Object.keys(patterns).join(", ")}`);
  }

  const config = patterns[pattern];

  // Generate code with options
  const code = config.generateCode(options);

  // Update structure with custom columns if provided
  const structure = { ...config.structure };
  if (pattern === "dashboard-grid" && options?.columns) {
    structure.columns = options.columns;
  }

  return {
    pattern,
    structure,
    components: config.components,
    code,
    tokens: [...config.tokens].sort(),
    slots: config.slots,
    usage: config.usage,
  };
}
