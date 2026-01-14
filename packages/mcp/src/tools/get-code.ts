import { z } from "zod";

// ============ INPUT SCHEMA ============

export const getCodeInputSchema = {
  component: z
    .enum(["button", "input", "card", "select", "modal"])
    .describe("Component to generate code for"),
  props: z
    .record(z.any())
    .optional()
    .describe("Props to apply to component"),
  children: z.string().optional().describe("Children content"),
  framework: z
    .enum(["react", "react-server"])
    .default("react")
    .optional()
    .describe("Target framework (react for client components, react-server for RSC)"),
  variant: z
    .string()
    .optional()
    .describe("Specific variant to use (e.g., 'destructive', 'outline')"),
};

// ============ OUTPUT SCHEMA ============

export const getCodeOutputSchema = {
  code: z.string().describe("Generated JSX/TSX code snippet"),
  component: z.string().describe("Component name used"),
  imports: z.array(z.string()).describe("Required import statements"),
  dependencies: z
    .array(z.string())
    .optional()
    .describe("npm packages required"),
  framework: z.string().describe("Target framework"),
  props: z
    .record(z.any())
    .optional()
    .describe("Props applied to the component"),
};

// ============ TYPES ============

export type GetCodeInput = {
  component: "button" | "input" | "card" | "select" | "modal";
  props?: Record<string, unknown>;
  children?: string;
  framework?: "react" | "react-server";
  variant?: string;
};

export type GetCodeOutput = {
  code: string;
  component: string;
  imports: string[];
  dependencies?: string[];
  framework: string;
  props?: Record<string, unknown>;
};

// ============ HELPERS ============

function generateImports(component: string): string[] {
  const importMap: Record<string, string[]> = {
    button: ['import { Button } from "@origen/react";'],
    input: ['import { Input } from "@origen/react";'],
    card: [
      'import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@origen/react";',
    ],
    select: ['import { Select } from "@origen/react";'],
    modal: [
      'import { Modal } from "@origen/react";',
      'import { Button } from "@origen/react";',
    ],
  };
  return importMap[component] || [];
}

function getDependencies(component: string): string[] {
  const depMap: Record<string, string[]> = {
    select: ["@base-ui-components/react"],
    modal: ["@base-ui-components/react"],
  };
  return depMap[component] || [];
}

export function getCode({
  component,
  props = {},
  children,
  framework = "react",
  variant,
}: GetCodeInput): GetCodeOutput {
  // Apply variant to props if specified
  const finalProps = variant ? { ...props, variant } : props;

  const componentName = component.charAt(0).toUpperCase() + component.slice(1);

  // Build props string
  const propsString = Object.entries(finalProps)
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`;
      }
      if (typeof value === "boolean") {
        return value ? key : `${key}={false}`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(" ");

  let code: string;

  // Generate code based on component type
  if (component === "card" && children) {
    // Card typically uses subcomponents
    code = `<Card${propsString ? ` ${propsString}` : ""}>
  <CardHeader>
    <CardTitle>${children}</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>`;
  } else if (component === "modal" && children) {
    code = `<Modal${propsString ? ` ${propsString}` : ""}>
  <Modal.Trigger>
    <Button>Open</Button>
  </Modal.Trigger>
  <Modal.Content title="${children}">
    {/* Content here */}
  </Modal.Content>
</Modal>`;
  } else if (component === "select") {
    const optionsCode = finalProps.options
      ? ""
      : `options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}`;
    code = `<Select${propsString ? ` ${propsString}` : ""}${optionsCode ? `\n  ${optionsCode}` : ""}${children ? `\n  placeholder="${children}"` : ""}\n/>`;
  } else if (children) {
    // Standard component with children
    code = `<${componentName}${propsString ? ` ${propsString}` : ""}>${children}</${componentName}>`;
  } else {
    // Standard self-closing component
    code = `<${componentName}${propsString ? ` ${propsString}` : ""} />`;
  }

  // Generate imports and dependencies
  const imports = generateImports(component);
  const deps = getDependencies(component);

  return {
    code,
    component: componentName,
    imports,
    dependencies: deps.length > 0 ? deps : undefined,
    framework,
    props: Object.keys(finalProps).length > 0 ? finalProps : undefined,
  };
}
