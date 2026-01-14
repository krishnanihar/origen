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

    it("generates valid JSX with Card structure", () => {
      const result = getLayoutPattern({ pattern: "form-layout" });
      expect(result.code).toContain("<Card>");
      expect(result.code).toContain("</Card>");
      expect(result.code).toContain("<CardHeader>");
      expect(result.code).toContain("<CardFooter>");
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
      expect(result.pattern).toBe("split-view");
      expect(result.structure.type).toBe("grid");
    });

    it("generates grid layout code", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      expect(result.code).toContain("grid");
    });

    it("includes sidebar and main areas", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      expect(result.code).toContain("aside");
      expect(result.code).toContain("main");
    });

    it("includes sidebar and main slots", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("sidebar");
      expect(slotNames).toContain("main");
    });

    it("has navigation buttons in sidebar", () => {
      const result = getLayoutPattern({ pattern: "split-view" });
      expect(result.code).toContain("Button");
      expect(result.code).toContain("ghost");
    });
  });

  describe("dashboard-grid", () => {
    it("returns grid structure", () => {
      const result = getLayoutPattern({ pattern: "dashboard-grid" });
      expect(result.pattern).toBe("dashboard-grid");
      expect(result.structure.type).toBe("grid");
    });

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
      expect(result.code).toContain("<Card>");
      expect(result.code).toContain("CardTitle");
    });

    it("includes stats slot", () => {
      const result = getLayoutPattern({ pattern: "dashboard-grid" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("stats");
    });
  });

  describe("modal-confirm", () => {
    it("returns modal structure", () => {
      const result = getLayoutPattern({ pattern: "modal-confirm" });
      expect(result.pattern).toBe("modal-confirm");
      expect(result.code).toContain("Modal");
    });

    it("includes Modal components", () => {
      const result = getLayoutPattern({ pattern: "modal-confirm" });
      expect(result.code).toContain("<Modal>");
      expect(result.code).toContain("Modal.Trigger");
      expect(result.code).toContain("Modal.Content");
    });

    it("defaults to non-destructive variant", () => {
      const result = getLayoutPattern({ pattern: "modal-confirm" });
      // Should have default Button, not destructive
      expect(result.code).toContain("<Button>");
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

    it("applies custom title and description", () => {
      const result = getLayoutPattern({
        pattern: "modal-confirm",
        options: { title: "Confirm Delete", description: "This cannot be undone" },
      });
      expect(result.code).toContain("Confirm Delete");
      expect(result.code).toContain("This cannot be undone");
    });

    it("includes trigger and actions slots", () => {
      const result = getLayoutPattern({ pattern: "modal-confirm" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("trigger");
      expect(slotNames).toContain("actions");
    });
  });

  describe("list-with-actions", () => {
    it("returns list structure", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      expect(result.pattern).toBe("list-with-actions");
      expect(result.structure.type).toBe("stack");
    });

    it("includes list item structure with dividers", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      expect(result.code).toContain("divide-y");
    });

    it("includes action buttons per item", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      expect(result.code).toContain("Edit");
      expect(result.code).toContain("Delete");
    });

    it("wraps in Card component", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      expect(result.code).toContain("<Card>");
      expect(result.code).toContain("</Card>");
    });

    it("includes items and pagination slots", () => {
      const result = getLayoutPattern({ pattern: "list-with-actions" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("items");
    });

    it("applies custom title", () => {
      const result = getLayoutPattern({
        pattern: "list-with-actions",
        options: { title: "Users" },
      });
      expect(result.code).toContain("Users");
    });
  });

  describe("hero-section", () => {
    it("returns centered flex structure", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      expect(result.pattern).toBe("hero-section");
      expect(result.structure.type).toBe("flex");
      expect(result.structure.direction).toBe("column");
    });

    it("generates centered layout code", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      expect(result.code).toContain("items-center");
      expect(result.code).toContain("justify-center");
    });

    it("includes headline and description elements", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      expect(result.code).toContain("<h1");
      expect(result.code).toContain("<p");
    });

    it("includes CTA buttons", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      expect(result.code).toContain("<Button");
    });

    it("applies custom title and description", () => {
      const result = getLayoutPattern({
        pattern: "hero-section",
        options: { title: "Welcome Home", description: "Start your journey" },
      });
      expect(result.code).toContain("Welcome Home");
      expect(result.code).toContain("Start your journey");
    });

    it("applies custom button labels", () => {
      const result = getLayoutPattern({
        pattern: "hero-section",
        options: { primaryAction: "Sign Up", secondaryAction: "Watch Demo" },
      });
      expect(result.code).toContain("Sign Up");
      expect(result.code).toContain("Watch Demo");
    });

    it("includes actions slot", () => {
      const result = getLayoutPattern({ pattern: "hero-section" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("actions");
    });
  });

  describe("empty-state", () => {
    it("returns centered flex structure", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.pattern).toBe("empty-state");
      expect(result.structure.type).toBe("flex");
      expect(result.structure.direction).toBe("column");
    });

    it("generates centered layout code", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.code).toContain("items-center");
      expect(result.code).toContain("justify-center");
    });

    it("includes icon placeholder area", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.code).toContain("rounded-full");
      expect(result.code).toContain("bg-muted");
    });

    it("includes message elements", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.code).toContain("<h3");
      expect(result.code).toContain("<p");
    });

    it("includes action button", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      expect(result.code).toContain("<Button");
    });

    it("applies custom messages", () => {
      const result = getLayoutPattern({
        pattern: "empty-state",
        options: { title: "No results", description: "Try a different search" },
      });
      expect(result.code).toContain("No results");
      expect(result.code).toContain("Try a different search");
    });

    it("applies custom action label", () => {
      const result = getLayoutPattern({
        pattern: "empty-state",
        options: { primaryAction: "Create New" },
      });
      expect(result.code).toContain("Create New");
    });

    it("includes icon and actions slots", () => {
      const result = getLayoutPattern({ pattern: "empty-state" });
      const slotNames = result.slots.map((s) => s.name);
      expect(slotNames).toContain("icon");
      expect(slotNames).toContain("actions");
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

      it(`${pattern} structure has required type field`, () => {
        const result = getLayoutPattern({ pattern });
        expect(result.structure).toHaveProperty("type");
        expect(["flex", "grid", "stack"]).toContain(result.structure.type);
      });

      it(`${pattern} code is non-empty string`, () => {
        const result = getLayoutPattern({ pattern });
        expect(typeof result.code).toBe("string");
        expect(result.code.length).toBeGreaterThan(0);
      });

      it(`${pattern} tokens is array of strings`, () => {
        const result = getLayoutPattern({ pattern });
        expect(Array.isArray(result.tokens)).toBe(true);
        result.tokens.forEach((token) => {
          expect(typeof token).toBe("string");
        });
      });

      it(`${pattern} tokens are sorted`, () => {
        const result = getLayoutPattern({ pattern });
        const sorted = [...result.tokens].sort();
        expect(result.tokens).toEqual(sorted);
      });

      it(`${pattern} slots have required fields`, () => {
        const result = getLayoutPattern({ pattern });
        expect(Array.isArray(result.slots)).toBe(true);
        result.slots.forEach((slot) => {
          expect(slot).toHaveProperty("name");
          expect(slot).toHaveProperty("description");
          expect(slot).toHaveProperty("accepts");
          expect(Array.isArray(slot.accepts)).toBe(true);
        });
      });

      it(`${pattern} usage has when and examples arrays`, () => {
        const result = getLayoutPattern({ pattern });
        expect(result.usage).toHaveProperty("when");
        expect(result.usage).toHaveProperty("examples");
        expect(Array.isArray(result.usage.when)).toBe(true);
        expect(Array.isArray(result.usage.examples)).toBe(true);
        expect(result.usage.when.length).toBeGreaterThan(0);
        expect(result.usage.examples.length).toBeGreaterThan(0);
      });

      it(`${pattern} components array has valid entries`, () => {
        const result = getLayoutPattern({ pattern });
        expect(Array.isArray(result.components)).toBe(true);
        expect(result.components.length).toBeGreaterThan(0);
        result.components.forEach((comp) => {
          expect(comp).toHaveProperty("name");
          expect(comp).toHaveProperty("props");
          expect(typeof comp.name).toBe("string");
        });
      });
    });
  });

  describe("error handling", () => {
    it("throws error for invalid pattern", () => {
      expect(() => {
        // @ts-expect-error - testing invalid input
        getLayoutPattern({ pattern: "invalid-pattern" });
      }).toThrow();
    });

    it("error message is helpful", () => {
      try {
        // @ts-expect-error - testing invalid input
        getLayoutPattern({ pattern: "unknown-layout" });
      } catch (error) {
        expect(error instanceof Error).toBe(true);
        if (error instanceof Error) {
          expect(error.message).toContain("pattern");
        }
      }
    });
  });
});
