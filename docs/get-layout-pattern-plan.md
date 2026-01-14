# get_layout_pattern Tool Implementation Plan

## Overview

A new MCP tool that returns pre-defined layout patterns with component structures, ready-to-use JSX code, and customization options. Complements `compose_interface` by providing structural templates for common UI layouts.

**Key difference from compose_interface:**
- `compose_interface` — intent-based, interprets natural language
- `get_layout_pattern` — explicit pattern selection, returns structural templates

---

## 1. Input Schema

```typescript
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
      columns: z.number().min(1).max(6).optional().describe("Number of columns for grid layouts"),
      primaryAction: z.string().optional().describe("Primary button label"),
      secondaryAction: z.string().optional().describe("Secondary button label"),
      variant: z.enum(["default", "destructive"]).optional().describe("Action variant for modals"),
    })
    .optional()
    .describe("Customization options for the pattern"),
};

export type GetLayoutPatternInput = {
  pattern:
    | "form-layout"
    | "split-view"
    | "dashboard-grid"
    | "modal-confirm"
    | "list-with-actions"
    | "hero-section"
    | "empty-state";
  options?: {
    title?: string;
    description?: string;
    columns?: number;
    primaryAction?: string;
    secondaryAction?: string;
    variant?: "default" | "destructive";
  };
};
```

### Parameter Details

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `pattern` | enum | Yes | — | One of 7 predefined layout patterns |
| `options.title` | string | No | Pattern default | Title text |
| `options.description` | string | No | Pattern default | Subtitle/description |
| `options.columns` | number | No | 3 | Grid column count (1-6) |
| `options.primaryAction` | string | No | "Submit" | Primary button label |
| `options.secondaryAction` | string | No | "Cancel" | Secondary button label |
| `options.variant` | enum | No | "default" | Button variant for destructive actions |

---

## 2. Output Schema

```typescript
export const getLayoutPatternOutputSchema = {
  pattern: z.string().describe("Pattern name"),
  structure: z.object({
    type: z.enum(["flex", "grid", "stack"]),
    direction: z.enum(["row", "column"]).optional(),
    gap: z.string().optional(),
    columns: z.number().optional(),
    areas: z.array(z.string()).optional(),
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
  slots: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      accepts: z.array(z.string()),
    })
  ).describe("Customization points in the layout"),
  usage: z.object({
    when: z.array(z.string()),
    examples: z.array(z.string()),
  }),
};

export type GetLayoutPatternOutput = {
  pattern: string;
  structure: {
    type: "flex" | "grid" | "stack";
    direction?: "row" | "column";
    gap?: string;
    columns?: number;
    areas?: string[];
  };
  components: Array<{
    name: string;
    props: Record<string, unknown>;
    slot?: string;
    children?: string | unknown[];
  }>;
  code: string;
  tokens: string[];
  slots: Array<{
    name: string;
    description: string;
    accepts: string[];
  }>;
  usage: {
    when: string[];
    examples: string[];
  };
};
```

### Output Fields

| Field | Description |
|-------|-------------|
| `pattern` | Pattern name for reference |
| `structure` | Layout configuration (flex/grid/stack with options) |
| `components` | Ordered component tree with nesting |
| `code` | Ready-to-use JSX snippet |
| `tokens` | Semantic tokens used by the pattern |
| `slots` | Customization points (where to insert content) |
| `usage` | When to use this pattern and examples |

---

## 3. Pattern Definitions

### Pattern 1: form-layout

Vertical form with labeled fields and action buttons.

```typescript
{
  pattern: "form-layout",
  structure: {
    type: "stack",
    direction: "column",
    gap: "6",
  },
  components: [
    { name: "Card", props: {}, slot: "wrapper" },
    { name: "CardHeader", props: {}, slot: "header" },
    { name: "CardTitle", props: {}, slot: "header", children: "{title}" },
    { name: "CardDescription", props: {}, slot: "header", children: "{description}" },
    { name: "CardContent", props: { className: "space-y-4" }, slot: "content" },
    {
      name: "FormField",
      props: {},
      slot: "content",
      children: [
        { name: "Label", props: { htmlFor: "field1" }, children: "Field 1" },
        { name: "Input", props: { id: "field1", placeholder: "Enter value" } },
      ],
    },
    { name: "CardFooter", props: { className: "flex justify-end gap-2" }, slot: "footer" },
    { name: "Button", props: { variant: "outline" }, slot: "footer", children: "{secondaryAction}" },
    { name: "Button", props: { variant: "default" }, slot: "footer", children: "{primaryAction}" },
  ],
  slots: [
    { name: "fields", description: "Form field area", accepts: ["Input", "Select", "FormField"] },
    { name: "actions", description: "Footer action buttons", accepts: ["Button"] },
  ],
  usage: {
    when: ["Collecting user input", "Data entry forms", "Settings forms"],
    examples: ["Contact form", "Profile edit", "Checkout form"],
  },
}
```

**Generated Code:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
    <CardDescription>Enter your information below</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="field1">Field 1</Label>
      <Input id="field1" placeholder="Enter value" />
    </div>
    {/* Add more fields here */}
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

---

### Pattern 2: split-view

Two-column layout with sidebar navigation and main content area.

```typescript
{
  pattern: "split-view",
  structure: {
    type: "grid",
    columns: 2,
    areas: ["sidebar", "main"],
    gap: "0",
  },
  components: [
    {
      name: "div",
      props: { className: "grid grid-cols-[250px_1fr] min-h-screen" },
      slot: "wrapper",
      children: [
        {
          name: "aside",
          props: { className: "border-r border-border bg-muted/30 p-4" },
          slot: "sidebar",
          children: [
            { name: "nav", props: { className: "space-y-2" } },
            { name: "Button", props: { variant: "ghost", className: "w-full justify-start" }, children: "Dashboard" },
            { name: "Button", props: { variant: "ghost", className: "w-full justify-start" }, children: "Settings" },
            { name: "Button", props: { variant: "ghost", className: "w-full justify-start" }, children: "Profile" },
          ],
        },
        {
          name: "main",
          props: { className: "p-6" },
          slot: "main",
          children: "{content}",
        },
      ],
    },
  ],
  slots: [
    { name: "sidebar", description: "Navigation sidebar", accepts: ["Button", "nav"] },
    { name: "main", description: "Main content area", accepts: ["Card", "div", "section"] },
  ],
  usage: {
    when: ["Admin dashboards", "Settings pages", "Documentation sites"],
    examples: ["App settings", "User management", "Content editor"],
  },
}
```

**Generated Code:**
```tsx
<div className="grid grid-cols-[250px_1fr] min-h-screen">
  <aside className="border-r border-border bg-muted/30 p-4">
    <nav className="space-y-2">
      <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
      <Button variant="ghost" className="w-full justify-start">Settings</Button>
      <Button variant="ghost" className="w-full justify-start">Profile</Button>
    </nav>
  </aside>
  <main className="p-6">
    {/* Main content here */}
  </main>
</div>
```

---

### Pattern 3: dashboard-grid

Responsive grid of stat cards with optional main content area.

```typescript
{
  pattern: "dashboard-grid",
  structure: {
    type: "grid",
    columns: 3, // Customizable via options.columns
    gap: "4",
  },
  components: [
    {
      name: "div",
      props: { className: "space-y-6" },
      slot: "wrapper",
      children: [
        {
          name: "div",
          props: { className: "grid grid-cols-{columns} gap-4" },
          slot: "stats",
          children: [
            {
              name: "Card",
              props: {},
              children: [
                { name: "CardHeader", props: { className: "pb-2" } },
                { name: "CardTitle", props: { className: "text-sm font-medium" }, children: "Total Users" },
                { name: "CardContent", props: {} },
                { name: "div", props: { className: "text-2xl font-bold" }, children: "1,234" },
              ],
            },
            {
              name: "Card",
              props: {},
              children: [
                { name: "CardHeader", props: { className: "pb-2" } },
                { name: "CardTitle", props: { className: "text-sm font-medium" }, children: "Revenue" },
                { name: "CardContent", props: {} },
                { name: "div", props: { className: "text-2xl font-bold" }, children: "$12,345" },
              ],
            },
            {
              name: "Card",
              props: {},
              children: [
                { name: "CardHeader", props: { className: "pb-2" } },
                { name: "CardTitle", props: { className: "text-sm font-medium" }, children: "Active Now" },
                { name: "CardContent", props: {} },
                { name: "div", props: { className: "text-2xl font-bold" }, children: "42" },
              ],
            },
          ],
        },
        {
          name: "Card",
          props: { className: "col-span-full" },
          slot: "main",
          children: "{content}",
        },
      ],
    },
  ],
  slots: [
    { name: "stats", description: "Stat card grid", accepts: ["Card"] },
    { name: "main", description: "Main content area below stats", accepts: ["Card", "div"] },
  ],
  usage: {
    when: ["Analytics dashboards", "Admin overviews", "Metrics displays"],
    examples: ["Sales dashboard", "User analytics", "System status"],
  },
}
```

**Generated Code:**
```tsx
<div className="space-y-6">
  <div className="grid grid-cols-3 gap-4">
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
</div>
```

---

### Pattern 4: modal-confirm

Confirmation dialog with title, message, and action buttons.

```typescript
{
  pattern: "modal-confirm",
  structure: {
    type: "stack",
    direction: "column",
    gap: "4",
  },
  components: [
    { name: "Modal", props: {}, slot: "wrapper" },
    { name: "Modal.Trigger", props: {}, slot: "trigger" },
    { name: "Button", props: { variant: "outline" }, slot: "trigger", children: "Open" },
    {
      name: "Modal.Content",
      props: { title: "{title}", description: "{description}" },
      slot: "content",
      children: [
        {
          name: "div",
          props: { className: "flex justify-end gap-2 mt-4" },
          slot: "actions",
          children: [
            { name: "Button", props: { variant: "outline" }, children: "{secondaryAction}" },
            { name: "Button", props: { variant: "{variant}" }, children: "{primaryAction}" },
          ],
        },
      ],
    },
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
}
```

**Generated Code (default variant):**
```tsx
<Modal>
  <Modal.Trigger>
    <Button variant="outline">Open</Button>
  </Modal.Trigger>
  <Modal.Content title="Confirm Action" description="Are you sure you want to proceed?">
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </Modal.Content>
</Modal>
```

**Generated Code (destructive variant):**
```tsx
<Modal>
  <Modal.Trigger>
    <Button variant="destructive">Delete</Button>
  </Modal.Trigger>
  <Modal.Content title="Delete Item" description="This action cannot be undone.">
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  </Modal.Content>
</Modal>
```

---

### Pattern 5: list-with-actions

List of items with inline action buttons and optional pagination.

```typescript
{
  pattern: "list-with-actions",
  structure: {
    type: "stack",
    direction: "column",
    gap: "0",
  },
  components: [
    { name: "Card", props: {}, slot: "wrapper" },
    { name: "CardHeader", props: {}, slot: "header" },
    { name: "CardTitle", props: {}, slot: "header", children: "{title}" },
    { name: "CardDescription", props: {}, slot: "header", children: "{description}" },
    {
      name: "CardContent",
      props: { className: "p-0" },
      slot: "content",
      children: [
        {
          name: "div",
          props: { className: "divide-y divide-border" },
          slot: "items",
          children: [
            {
              name: "div",
              props: { className: "flex items-center justify-between p-4" },
              children: [
                { name: "div", props: {}, children: "Item 1" },
                {
                  name: "div",
                  props: { className: "flex gap-2" },
                  children: [
                    { name: "Button", props: { variant: "ghost", size: "sm" }, children: "Edit" },
                    { name: "Button", props: { variant: "ghost", size: "sm" }, children: "Delete" },
                  ],
                },
              ],
            },
            // More items...
          ],
        },
      ],
    },
    {
      name: "CardFooter",
      props: { className: "justify-center" },
      slot: "footer",
      children: [
        { name: "Button", props: { variant: "outline" }, children: "Load More" },
      ],
    },
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
}
```

**Generated Code:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Items</CardTitle>
    <CardDescription>Manage your items</CardDescription>
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
</Card>
```

---

### Pattern 6: hero-section

Landing page hero with headline, description, and CTA buttons.

```typescript
{
  pattern: "hero-section",
  structure: {
    type: "flex",
    direction: "column",
    gap: "6",
  },
  components: [
    {
      name: "section",
      props: { className: "flex flex-col items-center justify-center min-h-[60vh] text-center px-4" },
      slot: "wrapper",
      children: [
        { name: "h1", props: { className: "text-4xl font-bold tracking-tight sm:text-6xl" }, children: "{title}" },
        { name: "p", props: { className: "mt-6 text-lg text-muted-foreground max-w-2xl" }, children: "{description}" },
        {
          name: "div",
          props: { className: "mt-10 flex items-center justify-center gap-4" },
          slot: "actions",
          children: [
            { name: "Button", props: { size: "lg" }, children: "{primaryAction}" },
            { name: "Button", props: { variant: "outline", size: "lg" }, children: "{secondaryAction}" },
          ],
        },
      ],
    },
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
}
```

**Generated Code:**
```tsx
<section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
    Welcome to Our App
  </h1>
  <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
    Build amazing things with our powerful tools and intuitive interface.
  </p>
  <div className="mt-10 flex items-center justify-center gap-4">
    <Button size="lg">Get Started</Button>
    <Button variant="outline" size="lg">Learn More</Button>
  </div>
</section>
```

---

### Pattern 7: empty-state

Placeholder for empty data with icon, message, and action.

```typescript
{
  pattern: "empty-state",
  structure: {
    type: "flex",
    direction: "column",
    gap: "4",
  },
  components: [
    {
      name: "div",
      props: { className: "flex flex-col items-center justify-center py-12 text-center" },
      slot: "wrapper",
      children: [
        {
          name: "div",
          props: { className: "rounded-full bg-muted p-4 mb-4" },
          slot: "icon",
          children: [
            { name: "InboxIcon", props: { className: "h-8 w-8 text-muted-foreground" } },
          ],
        },
        { name: "h3", props: { className: "text-lg font-semibold" }, children: "{title}" },
        { name: "p", props: { className: "text-sm text-muted-foreground max-w-sm mt-2" }, children: "{description}" },
        {
          name: "div",
          props: { className: "mt-6" },
          slot: "actions",
          children: [
            { name: "Button", props: {}, children: "{primaryAction}" },
          ],
        },
      ],
    },
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
}
```

**Generated Code:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="rounded-full bg-muted p-4 mb-4">
    <InboxIcon className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold">No items yet</h3>
  <p className="text-sm text-muted-foreground max-w-sm mt-2">
    Get started by creating your first item.
  </p>
  <div className="mt-6">
    <Button>Create Item</Button>
  </div>
</div>
```

---

## 4. Test Cases

### Unit Test Matrix

| Pattern | Options | Expected Structure | Key Assertions |
|---------|---------|-------------------|----------------|
| `form-layout` | default | stack/column | Has Card, CardHeader, CardFooter, 2 Buttons |
| `form-layout` | `{ title: "Custom" }` | stack/column | CardTitle contains "Custom" |
| `split-view` | default | grid (2 cols) | Has aside, main, grid-cols class |
| `dashboard-grid` | default | grid (3 cols) | Has 3 stat Cards |
| `dashboard-grid` | `{ columns: 4 }` | grid (4 cols) | grid-cols-4 in code |
| `modal-confirm` | default | stack/column | Modal, Trigger, Content, 2 Buttons |
| `modal-confirm` | `{ variant: "destructive" }` | stack/column | Button has variant="destructive" |
| `list-with-actions` | default | stack/column | Has divide-y, action buttons |
| `hero-section` | default | flex/column | Has h1, p, 2 Buttons, min-h-[60vh] |
| `hero-section` | `{ primaryAction: "Sign Up" }` | flex/column | Button contains "Sign Up" |
| `empty-state` | default | flex/column | Has icon container, h3, p, Button |
| `empty-state` | `{ title: "No results" }` | flex/column | h3 contains "No results" |

### Test File Structure

```typescript
// get-layout-pattern.test.ts
import { describe, it, expect } from "vitest";
import { getLayoutPattern } from "./get-layout-pattern";

describe("getLayoutPattern", () => {
  describe("form-layout", () => {
    it("returns form layout structure", () => {
      const result = getLayoutPattern({ pattern: "form-layout" });
      expect(result.pattern).toBe("form-layout");
      expect(result.structure.type).toBe("stack");
      expect(result.structure.direction).toBe("column");
    });

    it("includes Card components", () => {
      const result = getLayoutPattern({ pattern: "form-layout" });
      const names = result.components.map((c) => c.name);
      expect(names).toContain("Card");
      expect(names).toContain("CardHeader");
      expect(names).toContain("CardFooter");
    });

    it("applies custom title", () => {
      const result = getLayoutPattern({
        pattern: "form-layout",
        options: { title: "Contact Us" },
      });
      expect(result.code).toContain("Contact Us");
    });

    it("applies custom button labels", () => {
      const result = getLayoutPattern({
        pattern: "form-layout",
        options: { primaryAction: "Save", secondaryAction: "Discard" },
      });
      expect(result.code).toContain("Save");
      expect(result.code).toContain("Discard");
    });

    it("collects correct tokens", () => {
      const result = getLayoutPattern({ pattern: "form-layout" });
      expect(result.tokens).toContain("card");
      expect(result.tokens).toContain("border");
      expect(result.tokens).toContain("primary");
    });

    it("includes usage information", () => {
      const result = getLayoutPattern({ pattern: "form-layout" });
      expect(result.usage.when.length).toBeGreaterThan(0);
      expect(result.usage.examples.length).toBeGreaterThan(0);
    });

    it("defines customization slots", () => {
      const result = getLayoutPattern({ pattern: "form-layout" });
      expect(result.slots.length).toBeGreaterThan(0);
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("fields");
    });
  });

  describe("split-view", () => {
    it("returns grid structure", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      expect(result.structure.type).toBe("grid");
      expect(result.structure.columns).toBe(2);
    });

    it("generates grid-cols class in code", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      expect(result.code).toContain("grid-cols-[250px_1fr]");
    });

    it("includes sidebar and main slots", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("sidebar");
      expect(slotNames).toContain("main");
    });
  });

  describe("dashboard-grid", () => {
    it("defaults to 3 columns", () => {
      const result = getLayoutPattern({ pattern: "dashboard-grid" });
      expect(result.structure.columns).toBe(3);
      expect(result.code).toContain("grid-cols-3");
    });

    it("respects custom column count", () => {
      const result = getLayoutPattern({
        pattern: "dashboard-grid",
        options: { columns: 4 },
      });
      expect(result.structure.columns).toBe(4);
      expect(result.code).toContain("grid-cols-4");
    });

    it("includes stat cards", () => {
      const result = getLayoutPattern({ pattern: "dashboard-grid" });
      const cardCount = result.components.filter((c) => c.name === "Card").length;
      expect(cardCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("modal-confirm", () => {
    it("returns modal structure", () => {
      const result = getLayoutPattern({ pattern: "modal-confirm" });
      const names = result.components.map((c) => c.name);
      expect(names).toContain("Modal");
      expect(names).toContain("Modal.Trigger");
      expect(names).toContain("Modal.Content");
    });

    it("defaults to non-destructive variant", () => {
      const result = getLayoutPattern({ pattern: "modal-confirm" });
      expect(result.code).not.toContain('variant="destructive"');
    });

    it("applies destructive variant", () => {
      const result = getLayoutPattern({
        pattern: "modal-confirm",
        options: { variant: "destructive" },
      });
      expect(result.code).toContain('variant="destructive"');
    });

    it("applies custom action labels", () => {
      const result = getLayoutPattern({
        pattern: "modal-confirm",
        options: { primaryAction: "Delete", secondaryAction: "Keep" },
      });
      expect(result.code).toContain("Delete");
      expect(result.code).toContain("Keep");
    });
  });

  describe("list-with-actions", () => {
    it("includes list item structure", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      expect(result.code).toContain("divide-y");
      expect(result.code).toContain("justify-between");
    });

    it("includes action buttons", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      expect(result.code).toContain("Edit");
      expect(result.code).toContain("Delete");
    });

    it("includes pagination slot", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("pagination");
    });
  });

  describe("hero-section", () => {
    it("returns centered flex structure", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      expect(result.structure.type).toBe("flex");
      expect(result.code).toContain("items-center");
      expect(result.code).toContain("justify-center");
    });

    it("includes headline and description", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      expect(result.code).toContain("<h1");
      expect(result.code).toContain("<p");
    });

    it("applies custom title and description", () => {
      const result = getLayoutPattern({
        pattern: "hero-section",
        options: { title: "Welcome", description: "Get started today" },
      });
      expect(result.code).toContain("Welcome");
      expect(result.code).toContain("Get started today");
    });
  });

  describe("empty-state", () => {
    it("returns centered layout", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.code).toContain("items-center");
      expect(result.code).toContain("justify-center");
    });

    it("includes icon placeholder", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.code).toContain("rounded-full");
      expect(result.code).toContain("bg-muted");
    });

    it("applies custom messages", () => {
      const result = getLayoutPattern({
        pattern: "empty-state",
        options: { title: "No results", description: "Try a different search" },
      });
      expect(result.code).toContain("No results");
      expect(result.code).toContain("Try a different search");
    });
  });

  describe("output schema compliance", () => {
    const patterns = [
      "form-layout",
      "split-view",
      "dashboard-grid",
      "modal-confirm",
      "list-with-actions",
      "hero-section",
      "empty-state",
    ] as const;

    patterns.forEach((pattern) => {
      it(`${pattern} returns all required fields`, () => {
        const result = getLayoutPattern({ pattern });

        expect(result).toHaveProperty("pattern");
        expect(result).toHaveProperty("structure");
        expect(result).toHaveProperty("components");
        expect(result).toHaveProperty("code");
        expect(result).toHaveProperty("tokens");
        expect(result).toHaveProperty("slots");
        expect(result).toHaveProperty("usage");
      });

      it(`${pattern} code is non-empty string`, () => {
        const result = getLayoutPattern({ pattern });
        expect(typeof result.code).toBe("string");
        expect(result.code.length).toBeGreaterThan(0);
      });

      it(`${pattern} tokens is sorted array`, () => {
        const result = getLayoutPattern({ pattern });
        const sorted = [...result.tokens].sort();
        expect(result.tokens).toEqual(sorted);
      });
    });
  });
});
```

---

## 5. File Structure

```
packages/mcp/src/tools/
├── get-layout-pattern.ts       # Main implementation
├── get-layout-pattern.test.ts  # Unit tests
├── compose-interface.ts        # Existing (unchanged)
└── compose-interface.test.ts   # Existing (unchanged)
```

---

## 6. Server Registration

```typescript
// In server.ts
import {
  getLayoutPattern,
  getLayoutPatternInputSchema,
  getLayoutPatternOutputSchema,
} from "./tools/get-layout-pattern";

server.registerTool(
  "get_layout_pattern",
  {
    title: "Get Layout Pattern",
    description:
      "Get a pre-defined layout pattern with component structure, JSX code, and customization options. Returns ready-to-use templates for common UI layouts.",
    inputSchema: getLayoutPatternInputSchema,
    outputSchema: getLayoutPatternOutputSchema,
  },
  async ({ pattern, options }) => {
    const output = getLayoutPattern({ pattern, options });
    return {
      content: [
        {
          type: "text",
          text: `## ${output.pattern}\n\n${output.usage.when.join(", ")}\n\n\`\`\`tsx\n${output.code}\n\`\`\`\n\n**Slots:** ${output.slots.map((s) => s.name).join(", ")}\n**Tokens:** ${output.tokens.join(", ")}`,
        },
      ],
      structuredContent: output,
    };
  }
);
```

---

## Implementation Checklist

- [ ] Create `get-layout-pattern.ts` with schemas and types
- [ ] Define pattern configurations (7 patterns)
- [ ] Implement code generation for each pattern
- [ ] Implement options substitution ({title}, {primaryAction}, etc.)
- [ ] Implement token collection per pattern
- [ ] Implement slot definitions per pattern
- [ ] Create `get-layout-pattern.test.ts`
- [ ] Write tests for each pattern
- [ ] Write tests for options customization
- [ ] Write tests for output schema compliance
- [ ] Register tool in `server.ts` using `registerTool()`
- [ ] Update exports in `index.ts`
- [ ] Run full test suite
- [ ] Update README.md with usage example
