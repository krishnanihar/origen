import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  getTokens,
  getTokensInputSchema,
  getTokensOutputSchema,
} from "./tools/get-tokens";
import {
  getComponentSpec,
  getComponentSpecInputSchema,
  getComponentSpecOutputSchema,
} from "./tools/get-component-spec";
import {
  getCode,
  getCodeInputSchema,
  getCodeOutputSchema,
} from "./tools/get-code";
import {
  searchComponents,
  searchComponentsInputSchema,
  searchComponentsOutputSchema,
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

  server.registerTool(
    "get_tokens",
    {
      title: "Get Design Tokens",
      description:
        "Get design tokens by category (colors, spacing, typography, radius). Returns DTCG-format tokens with optional theme-specific semantic values.",
      inputSchema: getTokensInputSchema,
      outputSchema: getTokensOutputSchema,
    },
    async ({ category, theme }) => {
      const result = getTokens({ category, theme });

      const primitiveCount = result.primitives
        ? Object.keys(result.primitives).length
        : 0;
      const summary = `Retrieved ${category} tokens (${primitiveCount} primitives)${result.semantic ? ` with ${theme} semantic values` : ""}`;

      return {
        content: [{ type: "text", text: summary }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "get_component_spec",
    {
      title: "Get Component Spec",
      description:
        "Get complete specification for a component including props, variants, tokens, accessibility, and usage guidelines.",
      inputSchema: getComponentSpecInputSchema,
      outputSchema: getComponentSpecOutputSchema,
    },
    async ({ component }) => {
      const spec = getComponentSpec({ component });

      if ("error" in spec) {
        return {
          content: [{ type: "text", text: spec.error }],
          isError: true,
        };
      }

      const propCount = Object.keys(spec.props || {}).length;
      const exampleCount = spec.examples?.length ?? 0;
      const summary = `${spec.name}: ${spec.description}\n\nProps: ${propCount} | Examples: ${exampleCount} | Tokens: ${Object.keys(spec.tokens || {}).length}`;

      return {
        content: [{ type: "text", text: summary }],
        structuredContent: spec,
      };
    }
  );

  server.registerTool(
    "get_code",
    {
      title: "Get Component Code",
      description:
        "Generate implementation code for a component with specified props, variant, and framework target.",
      inputSchema: getCodeInputSchema,
      outputSchema: getCodeOutputSchema,
    },
    async ({ component, props, children, framework, variant }) => {
      const result = getCode({ component, props, children, framework, variant });

      const summary = `Generated ${result.component} code for ${result.framework}`;
      const codeBlock = `\`\`\`tsx\n${result.imports.join("\n")}\n\n${result.code}\n\`\`\``;

      return {
        content: [{ type: "text", text: `${summary}\n\n${codeBlock}` }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "search_components",
    {
      title: "Search Components",
      description:
        "Search for components by description, use case, or keywords. Returns ranked results with relevance scores.",
      inputSchema: searchComponentsInputSchema,
      outputSchema: searchComponentsOutputSchema,
    },
    async ({ query, limit }) => {
      const result = searchComponents({ query, limit });

      if (result.count === 0) {
        return {
          content: [{ type: "text", text: `No components found for "${query}"` }],
          structuredContent: result,
        };
      }

      const summary = result.results
        .map(
          (r) =>
            `- ${r.displayName} (${Math.round(r.score * 100)}%): ${r.description}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${result.count} component${result.count > 1 ? "s" : ""} for "${query}":\n\n${summary}`,
          },
        ],
        structuredContent: result,
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
