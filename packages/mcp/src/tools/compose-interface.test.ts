import { describe, it, expect } from "vitest";
import {
  composeInterface,
  matchIntent,
  extractFormFields,
  collectTokens,
  type ComposeInterfaceInput,
  type ComposeInterfaceOutput,
} from "./compose-interface";

describe("composeInterface", () => {
  describe("intent matching", () => {
    it("matches login keywords", () => {
      const result = matchIntent("login form");
      expect(result).toBeDefined();
      expect(result?.keywords).toContain("login");
    });

    it("matches signin variations", () => {
      expect(matchIntent("sign in page")).toBeDefined();
      expect(matchIntent("signin form")).toBeDefined();
    });

    it("matches 'log in' with space", () => {
      const result = matchIntent("log in form");
      expect(result).toBeDefined();
    });

    it("returns null for unknown intents", () => {
      expect(matchIntent("quantum flux capacitor")).toBeNull();
    });

    it("matches profile keywords", () => {
      const result = matchIntent("user profile card");
      expect(result).toBeDefined();
      expect(result?.keywords).toContain("profile");
    });

    it("matches navigation keywords", () => {
      const result = matchIntent("navigation header");
      expect(result).toBeDefined();
      expect(result?.keywords).toContain("navigation");
    });

    it("matches settings keywords", () => {
      const result = matchIntent("settings page");
      expect(result).toBeDefined();
      expect(result?.keywords).toContain("settings");
    });

    it("matches modal keywords", () => {
      const result = matchIntent("confirm dialog");
      expect(result).toBeDefined();
    });
  });

  describe("code generation", () => {
    it("generates valid Card structure for login", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      expect(result.code).toContain("<Card>");
      expect(result.code).toContain('type="email"');
      expect(result.code).toContain('type="password"');
      expect(result.code).toContain("<Button");
      expect(result.code).toContain("</Card>");
    });

    it("wraps in page container for page context", () => {
      const result = composeInterface({ intent: "login form", context: "page" });
      expect(result.code).toContain("min-h-screen");
      expect(result.code).toContain("bg-background");
    });

    it("uses minimal wrapper for component context", () => {
      const result = composeInterface({ intent: "login form", context: "component" });
      expect(result.code).not.toContain("min-h-screen");
      expect(result.code).toContain("<Card>");
    });

    it("uses flex layout for navigation", () => {
      const result = composeInterface({ intent: "navigation header", context: "section" });
      expect(result.layout.type).toBe("flex");
      expect(result.layout.direction).toBe("row");
    });

    it("uses stack layout for forms", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      expect(result.layout.type).toBe("stack");
      expect(result.layout.direction).toBe("column");
    });

    it("generates CardHeader and CardContent sections", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      expect(result.code).toContain("<CardHeader>");
      expect(result.code).toContain("<CardContent");
      expect(result.code).toContain("<CardFooter>");
    });

    it("generates ghost buttons for navigation", () => {
      const result = composeInterface({ intent: "navigation header", context: "section" });
      expect(result.code).toContain('variant="ghost"');
    });
  });

  describe("component list", () => {
    it("returns correct components for login form", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      const componentNames = result.components.map((c) => c.name);

      expect(componentNames).toContain("Card");
      expect(componentNames).toContain("Input");
      expect(componentNames).toContain("Button");
    });

    it("returns components with proper props", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      const emailInput = result.components.find(
        (c) => c.name === "Input" && c.props?.type === "email"
      );
      const passwordInput = result.components.find(
        (c) => c.name === "Input" && c.props?.type === "password"
      );

      expect(emailInput).toBeDefined();
      expect(passwordInput).toBeDefined();
    });

    it("returns components with slot assignments", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      const headerComponents = result.components.filter((c) => c.slot === "header");
      const contentComponents = result.components.filter((c) => c.slot === "content");
      const footerComponents = result.components.filter((c) => c.slot === "footer");

      expect(headerComponents.length).toBeGreaterThan(0);
      expect(contentComponents.length).toBeGreaterThan(0);
      expect(footerComponents.length).toBeGreaterThan(0);
    });

    it("returns Select component for settings", () => {
      const result = composeInterface({ intent: "settings page", context: "section" });
      const componentNames = result.components.map((c) => c.name);

      expect(componentNames).toContain("Select");
    });

    it("returns Modal component for dialogs", () => {
      const result = composeInterface({ intent: "confirm dialog", context: "section" });
      const componentNames = result.components.map((c) => c.name);

      expect(componentNames).toContain("Modal");
    });
  });

  describe("token collection", () => {
    it("collects tokens used by login form components", () => {
      const result = composeInterface({ intent: "login form", context: "section" });

      expect(result.tokens).toContain("primary");
      expect(result.tokens).toContain("card");
      expect(result.tokens).toContain("input");
    });

    it("returns sorted tokens array", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      const sorted = [...result.tokens].sort();

      expect(result.tokens).toEqual(sorted);
    });

    it("returns unique tokens only", () => {
      const result = composeInterface({ intent: "login form", context: "section" });
      const unique = [...new Set(result.tokens)];

      expect(result.tokens).toEqual(unique);
    });

    it("collectTokens helper works independently", () => {
      const components = [
        { name: "Button", props: {} },
        { name: "Input", props: {} },
      ];
      const tokens = collectTokens(components);

      expect(tokens).toContain("primary");
      expect(tokens).toContain("input");
    });
  });

  describe("dynamic field detection", () => {
    it("extracts email field from intent", () => {
      const fields = extractFormFields("form with email");
      expect(fields).toContain("email");
    });

    it("extracts password field from intent", () => {
      const fields = extractFormFields("form with password");
      expect(fields).toContain("password");
    });

    it("extracts multiple fields from intent", () => {
      const fields = extractFormFields("contact form with name email phone");
      expect(fields.length).toBeGreaterThanOrEqual(3);
    });

    it("adds email input when email mentioned in form intent", () => {
      const result = composeInterface({ intent: "form with email", context: "section" });
      const emailInput = result.components.find(
        (c) => c.name === "Input" && c.props?.type === "email"
      );

      expect(emailInput).toBeDefined();
    });

    it("adds multiple inputs for multiple fields mentioned", () => {
      const result = composeInterface({
        intent: "contact form with name email phone",
        context: "section",
      });
      const inputs = result.components.filter((c) => c.name === "Input");

      expect(inputs.length).toBeGreaterThanOrEqual(3);
    });

    it("detects message/comment as textarea type", () => {
      const fields = extractFormFields("feedback form with message");
      expect(fields).toContain("textarea");
    });

    it("detects date field", () => {
      const fields = extractFormFields("booking form with date");
      expect(fields).toContain("date");
    });
  });

  describe("error handling", () => {
    it("throws error for empty intent", () => {
      expect(() => {
        composeInterface({ intent: "", context: "section" });
      }).toThrow();
    });

    it("throws error for whitespace-only intent", () => {
      expect(() => {
        composeInterface({ intent: "   ", context: "section" });
      }).toThrow();
    });

    it("returns suggestions for unknown intent", () => {
      const result = composeInterface({ intent: "xyz123 unknown", context: "section" });

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it("returns empty components array for unknown intent", () => {
      const result = composeInterface({ intent: "xyz123 unknown", context: "section" });

      expect(result.components).toEqual([]);
    });

    it("returns fallback code comment for unknown intent", () => {
      const result = composeInterface({ intent: "xyz123 unknown", context: "section" });

      expect(result.code).toContain("//");
    });

    it("suggestions include common patterns", () => {
      const result = composeInterface({ intent: "xyz123 unknown", context: "section" });

      expect(result.suggestions).toContain("login form");
    });
  });

  describe("output schema compliance", () => {
    it("returns all required output fields", () => {
      const result = composeInterface({ intent: "login form", context: "section" });

      expect(result).toHaveProperty("layout");
      expect(result).toHaveProperty("components");
      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("tokens");
    });

    it("layout has required type field", () => {
      const result = composeInterface({ intent: "login form", context: "section" });

      expect(result.layout).toHaveProperty("type");
      expect(["flex", "grid", "stack"]).toContain(result.layout.type);
    });

    it("components array contains objects with name and props", () => {
      const result = composeInterface({ intent: "login form", context: "section" });

      for (const component of result.components) {
        expect(component).toHaveProperty("name");
        expect(component).toHaveProperty("props");
      }
    });

    it("code is a non-empty string", () => {
      const result = composeInterface({ intent: "login form", context: "section" });

      expect(typeof result.code).toBe("string");
      expect(result.code.length).toBeGreaterThan(0);
    });

    it("tokens is an array of strings", () => {
      const result = composeInterface({ intent: "login form", context: "section" });

      expect(Array.isArray(result.tokens)).toBe(true);
      for (const token of result.tokens) {
        expect(typeof token).toBe("string");
      }
    });
  });
});
