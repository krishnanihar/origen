import { z } from "zod";
import componentSpecs from "../data/component-specs.json";

// ============ INPUT SCHEMA ============

export const getComponentSpecInputSchema = {
  component: z
    .enum(["button", "input", "card", "select", "modal"])
    .describe("Component name to retrieve specification for"),
};

// ============ OUTPUT SCHEMA ============

export const getComponentSpecOutputSchema = {
  name: z.string().describe("Component display name"),
  description: z.string().describe("Component description and purpose"),
  props: z
    .record(
      z.object({
        type: z.string(),
        values: z.array(z.string()).optional(),
        default: z.any().optional(),
        required: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .describe("Component props with types and defaults"),
  subcomponents: z
    .array(z.string())
    .optional()
    .describe("Subcomponents for compound components"),
  contentProps: z
    .record(z.any())
    .optional()
    .describe("Props for content subcomponent (e.g., Modal.Content)"),
  tokens: z
    .record(z.any())
    .describe("Design tokens used by this component"),
  accessibility: z
    .object({
      role: z.string().optional(),
      focusTrap: z.boolean().optional(),
      requiresLabel: z.boolean().optional(),
      semanticStructure: z.boolean().optional(),
      keyboardInteraction: z.array(z.string()).optional(),
    })
    .optional()
    .describe("Accessibility information"),
  usage: z
    .object({
      when: z.array(z.string()),
      avoid: z.array(z.string()).optional(),
    })
    .optional()
    .describe("Usage guidelines"),
  examples: z
    .array(
      z.object({
        title: z.string(),
        code: z.string(),
      })
    )
    .optional()
    .describe("Code examples"),
};

// ============ TYPES ============

export type GetComponentSpecInput = {
  component: "button" | "input" | "card" | "select" | "modal";
};

export type GetComponentSpecOutput = {
  name: string;
  description: string;
  props: Record<
    string,
    {
      type: string;
      values?: string[];
      default?: unknown;
      required?: boolean;
      description?: string;
    }
  >;
  subcomponents?: string[];
  contentProps?: Record<string, unknown>;
  tokens: Record<string, unknown>;
  accessibility?: {
    role?: string;
    focusTrap?: boolean;
    requiresLabel?: boolean;
    semanticStructure?: boolean;
    keyboardInteraction?: string[];
  };
  usage?: {
    when: string[];
    avoid?: string[];
  };
  examples?: Array<{
    title: string;
    code: string;
  }>;
};

export function getComponentSpec({ component }: GetComponentSpecInput) {
  const spec = componentSpecs[component as keyof typeof componentSpecs];

  if (!spec) {
    return {
      error: `Component "${component}" not found.`,
    };
  }

  return spec;
}
