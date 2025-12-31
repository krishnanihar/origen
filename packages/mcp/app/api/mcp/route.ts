import { createServer } from "../../../src/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const server = createServer();

export async function POST(request: Request) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  const response = await transport.handleRequest(request);
  return response;
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "origen",
      version: "0.1.0",
      description: "MCP server for Origen design system",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
