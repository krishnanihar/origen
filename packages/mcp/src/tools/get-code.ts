import { z } from "zod";

export const getCodeSchema = {
  component: z
    .enum(["button", "input", "card", "select", "modal"])
    .describe("Component to generate code for"),
  props: z
    .record(z.any())
    .optional()
    .describe("Props to apply to component"),
  children: z.string().optional().describe("Children content"),
};

export type GetCodeInput = {
  component: "button" | "input" | "card" | "select" | "modal";
  props?: Record<string, unknown>;
  children?: string;
};

export function getCode({ component, props = {}, children }: GetCodeInput) {
  const componentName = component.charAt(0).toUpperCase() + component.slice(1);

  // Build props string
  const propsString = Object.entries(props)
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

  // Generate code based on component type
  if (component === "card" && children) {
    // Card typically uses subcomponents
    return `<Card${propsString ? ` ${propsString}` : ""}>
  <CardHeader>
    <CardTitle>${children}</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>`;
  }

  if (component === "modal" && children) {
    return `<Modal${propsString ? ` ${propsString}` : ""}>
  <Modal.Trigger>
    <Button>Open</Button>
  </Modal.Trigger>
  <Modal.Content title="${children}">
    {/* Content here */}
  </Modal.Content>
</Modal>`;
  }

  if (component === "select") {
    const optionsCode = props.options
      ? ""
      : `options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}`;
    return `<Select${propsString ? ` ${propsString}` : ""}${optionsCode ? `\n  ${optionsCode}` : ""}${children ? `\n  placeholder="${children}"` : ""}\n/>`;
  }

  // Standard component
  if (children) {
    return `<${componentName}${propsString ? ` ${propsString}` : ""}>${children}</${componentName}>`;
  }

  return `<${componentName}${propsString ? ` ${propsString}` : ""} />`;
}
