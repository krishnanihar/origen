import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getTokens, getTokensSchema } from "./tools/get-tokens";
import {
  getComponentSpec,
  getComponentSpecSchema,
} from "./tools/get-component-spec";
import { getCode, getCodeSchema } from "./tools/get-code";
import {
  searchComponents,
  searchComponentsSchema,
} from "./tools/search-components";
import {
  composeInterface,
  composeInterfaceInputSchema,
  composeInterfaceOutputSchema,
} from "./tools/compose-interface";
import {
  getLayoutPattern,
  getLayoutPatternInputSchema,
  getLayoutPatternOutputSchema,
} from "./tools/get-layout-pattern";
import {
  validateAccessibility,
  validateAccessibilityInputSchema,
  validateAccessibilityOutputSchema,
} from "./tools/validate-accessibility";
import {
  tokenResources,
  getTokenResource,
} from "./resources/tokens";
import {
  componentResources,
  getComponentResource,
} from "./resources/components";

export function createServer() {
  const server = new McpServer({
    name: "origen",
    version: "0.1.0",
  });

  // ============ TOOLS ============

  server.tool(
    "get_tokens",
    "Get design tokens by category (colors, spacing, typography, radius). Returns DTCG-format tokens.",
    getTokensSchema,
    async ({ category, theme }) => {
      const result = getTokens({ category, theme });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_component_spec",
    "Get complete specification for a component including props, variants, tokens, and usage guidelines.",
    getComponentSpecSchema,
    async ({ component }) => {
      const spec = getComponentSpec({ component });
      if ("error" in spec) {
        return {
          content: [{ type: "text", text: spec.error }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(spec, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_code",
    "Generate implementation code for a component with specified props.",
    getCodeSchema,
    async ({ component, props, children }) => {
      const code = getCode({ component, props, children });
      return {
        content: [
          {
            type: "text",
            text: `\`\`\`tsx\n${code}\n\`\`\``,
          },
        ],
      };
    }
  );

  server.tool(
    "search_components",
    "Search for components by description or use case.",
    searchComponentsSchema,
    async ({ query }) => {
      const results = searchComponents({ query });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  // Register compose_interface with the new registerTool() API
  server.registerTool(
    "compose_interface",
    {
      title: "Compose Interface",
      description:
        "Generate a composed UI interface from natural language intent. Returns layout configuration, component list, JSX code, and design tokens used.",
      inputSchema: composeInterfaceInputSchema,
      outputSchema: composeInterfaceOutputSchema,
    },
    async ({ intent, context }) => {
      try {
        const output = composeInterface({ intent, context });
        const summary = output.suggestions
          ? `No matching pattern found. Suggestions: ${output.suggestions.join(", ")}`
          : `Generated ${context} for "${intent}"`;

        return {
          content: [
            {
              type: "text",
              text: `${summary}\n\n\`\`\`tsx\n${output.code}\n\`\`\`\n\nComponents: ${output.components.map((c) => c.name).join(", ")}\nTokens: ${output.tokens.join(", ")}`,
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register get_layout_pattern with the new registerTool() API
  server.registerTool(
    "get_layout_pattern",
    {
      title: "Get Layout Pattern",
      description:
        "Get a pre-built layout pattern with structure, components, generated code, and usage guidance. Patterns include form-layout, split-view, dashboard-grid, modal-confirm, list-with-actions, hero-section, and empty-state.",
      inputSchema: getLayoutPatternInputSchema,
      outputSchema: getLayoutPatternOutputSchema,
    },
    async ({ pattern, options }) => {
      try {
        const output = getLayoutPattern({ pattern, options });

        return {
          content: [
            {
              type: "text",
              text: `Pattern: ${output.pattern}\nStructure: ${output.structure.type}${output.structure.columns ? ` (${output.structure.columns} columns)` : ""}\n\n\`\`\`tsx\n${output.code}\n\`\`\`\n\nComponents: ${output.components.map((c) => c.name).join(", ")}\nTokens: ${output.tokens.join(", ")}`,
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register validate_accessibility with the new registerTool() API
  server.registerTool(
    "validate_accessibility",
    {
      title: "Validate Accessibility",
      description:
        "Validate JSX code or component array for WCAG 2.1 AA accessibility issues. Returns issues with severity, WCAG references, and fix suggestions. Accepts code string or components array from compose_interface/get_layout_pattern.",
      inputSchema: validateAccessibilityInputSchema,
      outputSchema: validateAccessibilityOutputSchema,
    },
    async ({ code, components, context }) => {
      try {
        const output = validateAccessibility({ code, components, context });

        const issuesSummary =
          output.issues.length > 0
            ? output.issues
                .map((i) => `- [${i.severity.toUpperCase()}] ${i.message}`)
                .join("\n")
            : "No issues found.";

        return {
          content: [
            {
              type: "text",
              text: `Accessibility Score: ${output.score}/100\n\n${output.summary}\n\n${issuesSummary}`,
            },
          ],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Validation error",
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ============ RESOURCES ============

  // Register token resources
  for (const resource of tokenResources) {
    server.resource(
      resource.uri,
      resource.description,
      async () => {
        const content = getTokenResource(resource.uri);
        if (!content) {
          return { contents: [] };
        }
        return {
          contents: [content],
        };
      }
    );
  }

  // Register component resources
  for (const resource of componentResources) {
    server.resource(
      resource.uri,
      resource.description,
      async () => {
        const content = getComponentResource(resource.uri);
        if (!content) {
          return { contents: [] };
        }
        return {
          contents: [content],
        };
      }
    );
  }

  return server;
}

// Export a singleton instance for direct use
export const server = createServer();
