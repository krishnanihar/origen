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
