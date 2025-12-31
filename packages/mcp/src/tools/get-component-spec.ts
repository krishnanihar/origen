import { z } from "zod";
import componentSpecs from "../data/component-specs.json";

export const getComponentSpecSchema = {
  component: z
    .enum(["button", "input", "card", "select", "modal"])
    .describe("Component name"),
};

export type GetComponentSpecInput = {
  component: "button" | "input" | "card" | "select" | "modal";
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
