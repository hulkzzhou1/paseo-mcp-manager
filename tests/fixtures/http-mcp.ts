import { createServer } from "node:http";

export async function startHttpMcp() {
  const calls: string[] = [];
  const requests: string[] = [];
  const server = createServer(async (request, response) => {
    requests.push(request.method ?? "unknown");
    if (request.headers.authorization !== "Bearer fake-token") { response.writeHead(401).end(); return; }
    if (request.method !== "POST") { response.writeHead(405, { Allow: "POST" }).end(); return; }
    let body = "";
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 1_000_000) { response.writeHead(413).end(); return; }
    }
    let message;
    try { message = JSON.parse(body); } catch { response.writeHead(400).end(); return; }
    if (message.id === undefined) { response.writeHead(202).end(); return; }
    let result: unknown;
    if (message.method === "initialize") result = { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "mcp-manager-fixture", version: "1.0.0" } };
    else if (message.method === "tools/list") result = { tools: [{ name: "fixture_value", description: "Return the MCP Manager integration test marker. Call with no arguments.", inputSchema: { type: "object", properties: {}, additionalProperties: false } }] };
    else if (message.method === "tools/call" && message.params.name === "fixture_value") {
      calls.push("fixture_value");
      result = { content: [{ type: "text", text: "MCP_MANAGER_HTTP_VERIFIED" }] };
    } else if (message.method === "ping") result = {};
    else { response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } })); return; }
    response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }));
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Fixture did not bind a TCP port");
  return { url: `http://127.0.0.1:${address.port}/mcp`, calls, requests, close: () => new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done())) };
}
