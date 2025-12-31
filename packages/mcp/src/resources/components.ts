import componentSpecs from "../data/component-specs.json";

const componentNames = ["button", "input", "card", "select", "modal"] as const;
type ComponentName = (typeof componentNames)[number];

export const componentResources = componentNames.map((name) => ({
  uri: `components://${name}`,
  name: `${name.charAt(0).toUpperCase() + name.slice(1)} Component`,
  description: `Specification for the ${name} component`,
  mimeType: "application/json",
}));

export function getComponentResource(uri: string) {
  // Parse URI: components://button -> button
  const match = uri.match(/^components:\/\/(.+)$/);
  if (!match) {
    return null;
  }

  const componentName = match[1] as ComponentName;
  const spec = componentSpecs[componentName as keyof typeof componentSpecs];

  if (!spec) {
    return null;
  }

  return {
    uri,
    mimeType: "application/json",
    text: JSON.stringify(spec, null, 2),
  };
}

export function listComponentResources() {
  return componentResources;
}
