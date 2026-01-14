import { describe, it, expect } from "vitest";
import { validateAccessibility } from "./validate-accessibility";

describe("validateAccessibility", () => {
  // ============ VALID CODE TESTS ============

  describe("valid code", () => {
    it("should return valid: true for accessible Button with text", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "Submit" }],
      });
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("should return valid: true for Input with aria-label", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: { "aria-label": "Email address" } }],
      });
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("should return valid: true for Input with aria-labelledby", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: { "aria-labelledby": "email-label" } }],
      });
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("should return valid: true for Input with id (for label association)", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: { id: "email" } }],
      });
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("should return valid: true for Modal.Content with title", () => {
      const result = validateAccessibility({
        components: [
          { name: "Modal.Content", props: { title: "Confirm", description: "Are you sure?" } },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("should return valid: true for Select with aria-label", () => {
      const result = validateAccessibility({
        components: [{ name: "Select", props: { "aria-label": "Choose country" } }],
      });
      expect(result.valid).toBe(true);
      expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    });

    it("should return score of 100 for fully accessible components", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {}, children: "Click me" },
          { name: "Input", props: { "aria-label": "Username" } },
        ],
      });
      expect(result.score).toBe(100);
    });

    it("should return empty issues array for accessible code", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "Save" }],
      });
      expect(result.issues).toHaveLength(0);
    });
  });

  // ============ INPUT VALIDATION TESTS ============

  describe("Input validation", () => {
    it("should error when Input has no label", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: { type: "text" } }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "input-needs-label",
          severity: "error",
          component: "Input",
        })
      );
    });

    it("should include suggestion for Input without label", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: {} }],
      });
      const issue = result.issues.find((i) => i.rule === "input-needs-label");
      expect(issue).toBeDefined();
      expect(issue?.suggestion).toContain("aria-label");
    });

    it("should error when Input has only placeholder (no label)", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: { placeholder: "Enter email" } }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ rule: "input-needs-label", severity: "error" })
      );
    });

    it("should warn when Input uses placeholder without visible label", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: { id: "email", placeholder: "Email" } }],
      });
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "placeholder-not-label",
          severity: "warning",
        })
      );
    });

    it("should include WCAG reference for Input issues", () => {
      const result = validateAccessibility({
        components: [{ name: "Input", props: {} }],
      });
      const issue = result.issues.find((i) => i.rule === "input-needs-label");
      expect(issue?.wcag).toBeDefined();
      expect(issue?.wcag).toContain("4.1.2");
    });
  });

  // ============ BUTTON VALIDATION TESTS ============

  describe("Button validation", () => {
    it("should error when Button has no children and no aria-label", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: { variant: "default" } }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "button-needs-name",
          severity: "error",
          component: "Button",
        })
      );
    });

    it("should include suggestion for Button without accessible name", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {} }],
      });
      const issue = result.issues.find((i) => i.rule === "button-needs-name");
      expect(issue).toBeDefined();
      expect(issue?.suggestion).toBeDefined();
      expect(issue?.suggestion.length).toBeGreaterThan(0);
    });

    it("should error when Button has empty string children", () => {
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
      expect(result.issues).toContainEqual(
        expect.objectContaining({ rule: "button-needs-name", severity: "error" })
      );
    });

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

  // ============ MODAL VALIDATION TESTS ============

  describe("Modal validation", () => {
    it("should error when Modal.Content has no title or aria-label", () => {
      const result = validateAccessibility({
        components: [{ name: "Modal.Content", props: {} }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "modal-needs-label",
          severity: "error",
          component: "Modal.Content",
        })
      );
    });

    it("should warn when Modal.Content has title but no description", () => {
      const result = validateAccessibility({
        components: [{ name: "Modal.Content", props: { title: "Confirm" } }],
      });
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "modal-needs-description",
          severity: "warning",
        })
      );
    });

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

    it("should pass when Modal.Content has aria-labelledby", () => {
      const result = validateAccessibility({
        components: [{ name: "Modal.Content", props: { "aria-labelledby": "modal-title" } }],
      });
      expect(result.issues.filter((i) => i.rule === "modal-needs-label")).toHaveLength(0);
    });

    it("should have no Modal.Content issues when title and description provided", () => {
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

  // ============ SELECT VALIDATION TESTS ============

  describe("Select validation", () => {
    it("should error when Select has no label", () => {
      const result = validateAccessibility({
        components: [{ name: "Select", props: { placeholder: "Choose" } }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "select-needs-label",
          severity: "error",
          component: "Select",
        })
      );
    });

    it("should pass when Select has aria-label", () => {
      const result = validateAccessibility({
        components: [{ name: "Select", props: { "aria-label": "Select country" } }],
      });
      expect(result.issues.filter((i) => i.rule === "select-needs-label")).toHaveLength(0);
    });

    it("should pass when Select has aria-labelledby", () => {
      const result = validateAccessibility({
        components: [{ name: "Select", props: { "aria-labelledby": "country-label" } }],
      });
      expect(result.issues.filter((i) => i.rule === "select-needs-label")).toHaveLength(0);
    });

    it("should pass when Select has id (for label association)", () => {
      const result = validateAccessibility({
        components: [{ name: "Select", props: { id: "country-select" } }],
      });
      expect(result.issues.filter((i) => i.rule === "select-needs-label")).toHaveLength(0);
    });
  });

  // ============ IMAGE VALIDATION TESTS ============

  describe("Image validation", () => {
    it("should error when img has no alt", () => {
      const result = validateAccessibility({
        components: [{ name: "img", props: { src: "/photo.jpg" } }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "img-needs-alt",
          severity: "error",
          component: "img",
        })
      );
    });

    it("should warn when alt contains 'image of'", () => {
      const result = validateAccessibility({
        components: [{ name: "img", props: { alt: "Image of a sunset" } }],
      });
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          rule: "redundant-alt",
          severity: "warning",
        })
      );
    });

    it("should warn when alt contains 'picture of'", () => {
      const result = validateAccessibility({
        components: [{ name: "img", props: { alt: "Picture of mountains" } }],
      });
      expect(result.issues).toContainEqual(
        expect.objectContaining({ rule: "redundant-alt", severity: "warning" })
      );
    });

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

  // ============ MULTIPLE ISSUES TESTS ============

  describe("multiple issues detection", () => {
    it("should detect multiple issues from different components", () => {
      const result = validateAccessibility({
        components: [
          { name: "Input", props: {} },
          { name: "Button", props: {} },
          { name: "Select", props: {} },
        ],
      });
      expect(result.valid).toBe(false);
      expect(result.issues.filter((i) => i.severity === "error").length).toBeGreaterThanOrEqual(3);
    });

    it("should detect multiple issues of same type", () => {
      const result = validateAccessibility({
        components: [
          { name: "Input", props: { placeholder: "Name" } },
          { name: "Input", props: { placeholder: "Email" } },
          { name: "Input", props: { placeholder: "Phone" } },
        ],
      });
      expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(3);
    });

    it("should report both errors and warnings", () => {
      const result = validateAccessibility({
        components: [
          { name: "Input", props: {} }, // error
          { name: "Modal.Content", props: { title: "Test" } }, // warning (no description)
        ],
      });
      expect(result.issues.filter((i) => i.severity === "error").length).toBeGreaterThan(0);
      expect(result.issues.filter((i) => i.severity === "warning").length).toBeGreaterThan(0);
    });

    it("should include all issues in array", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {} },
          { name: "Input", props: {} },
        ],
      });
      expect(result.issues.length).toBe(2);
    });
  });

  // ============ SCORE CALCULATION TESTS ============

  describe("score calculation", () => {
    it("should return score of 100 for fully accessible components", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {}, children: "Submit" },
          { name: "Input", props: { "aria-label": "Email" } },
        ],
      });
      expect(result.score).toBe(100);
    });

    it("should deduct 25 points per error", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {} }, // error: -25
        ],
      });
      expect(result.score).toBe(75);
    });

    it("should deduct 25 points for each error", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {} }, // error: -25
          { name: "Input", props: {} }, // error: -25
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
    });

    it("should combine error and warning deductions", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {} }, // error: -25
          { name: "Modal.Content", props: { title: "Test" } }, // warning: -10
        ],
      });
      expect(result.score).toBe(65);
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

    it("should return score reflecting severity mix", () => {
      const result = validateAccessibility({
        components: [
          { name: "Input", props: {} }, // error: -25
          { name: "Input", props: { id: "x", placeholder: "Y" } }, // warning: -10
        ],
      });
      // 100 - 25 - 10 = 65
      expect(result.score).toBe(65);
    });
  });

  // ============ SUMMARY TESTS ============

  describe("summary generation", () => {
    it("should include summary in output", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "Click" }],
      });
      expect(result.summary).toBeDefined();
      expect(typeof result.summary).toBe("string");
    });

    it("should generate positive summary for valid code", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "Submit" }],
      });
      expect(result.summary.toLowerCase()).toMatch(/pass|valid|no issues|accessible/);
    });

    it("should include issue count in failure summary", () => {
      const result = validateAccessibility({
        components: [
          { name: "Button", props: {} },
          { name: "Input", props: {} },
        ],
      });
      expect(result.summary).toMatch(/2|two/i);
    });
  });

  // ============ PASSED RULES TESTS ============

  describe("passedRules tracking", () => {
    it("should include passedRules in output", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "Click" }],
      });
      expect(result.passedRules).toBeDefined();
      expect(Array.isArray(result.passedRules)).toBe(true);
    });

    it("should list passed rules when component is valid", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "Submit" }],
      });
      expect(result.passedRules).toContain("button-needs-name");
    });
  });

  // ============ EDGE CASES ============

  describe("edge cases", () => {
    it("should handle empty components array", () => {
      const result = validateAccessibility({
        components: [],
      });
      expect(result.valid).toBe(true);
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
    });

    it("should handle unknown component gracefully", () => {
      const result = validateAccessibility({
        components: [{ name: "UnknownComponent", props: {} }],
      });
      expect(result).toBeDefined();
      // Unknown components should not cause errors
      expect(result.valid).toBe(true);
    });

    it("should handle components without props", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: {}, children: "OK" }],
      });
      expect(result.valid).toBe(true);
    });

    it("should handle null/undefined children", () => {
      const result = validateAccessibility({
        components: [{ name: "Button", props: { "aria-label": "Close" }, children: undefined }],
      });
      expect(result.valid).toBe(true);
    });
  });

  // ============ JSX CODE PARSING TESTS ============

  describe("JSX code parsing", () => {
    it("should parse self-closing components from code", () => {
      const result = validateAccessibility({
        code: '<Input type="email" />',
      });
      expect(result.issues).toContainEqual(
        expect.objectContaining({ rule: "input-needs-label" })
      );
    });

    it("should parse components with children from code", () => {
      const result = validateAccessibility({
        code: "<Button>Submit</Button>",
      });
      expect(result.valid).toBe(true);
    });

    it("should extract aria-label prop from code", () => {
      const result = validateAccessibility({
        code: '<Input aria-label="Your name" />',
      });
      expect(result.issues.filter((i) => i.rule === "input-needs-label")).toHaveLength(0);
    });

    it("should parse multiple components from code", () => {
      const result = validateAccessibility({
        code: `
          <Input placeholder="Name" />
          <Button>Save</Button>
        `,
      });
      expect(result.issues).toContainEqual(
        expect.objectContaining({ rule: "input-needs-label" })
      );
    });
  });

  // ============ INPUT VALIDATION (code vs components) ============

  describe("input validation", () => {
    it("should prefer components over code when both provided", () => {
      const result = validateAccessibility({
        code: "<Button>Valid</Button>",
        components: [{ name: "Button", props: {} }], // invalid
      });
      expect(result.valid).toBe(false);
    });

    it("should throw error when neither code nor components provided", () => {
      expect(() => validateAccessibility({})).toThrow();
    });
  });
});
