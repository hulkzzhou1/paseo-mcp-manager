import { createInterface } from "node:readline";
import { appendFileSync } from "node:fs";

const record = process.env.MCP_FIXTURE_RECORD;
const args = process.argv.slice(2);
const valid = process.env.MCP_FIXTURE_TOKEN === "fake-stdio-token" && JSON.stringify(args) === JSON.stringify(["one argument", "$(literal); 'quoted'", ""]);
if (record) appendFileSync(record, JSON.stringify({ event: "start", valid, args }) + "\n");
const input = createInterface({ input: process.stdin });
input.on("line", (line) => {
  const message = JSON.parse(line);
  if (message.id === undefined) return;
  let result;
  if (message.method === "initialize") result = { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "mcp-manager-stdio-fixture", version: "1.0.0" } };
  else if (message.method === "tools/list") result = { tools: [{ name: "fixture_stdio_value", description: "Return the deterministic stdio integration marker. Call with no arguments.", inputSchema: { type: "object", properties: {}, additionalProperties: false } }] };
  else if (message.method === "tools/call" && message.params.name === "fixture_stdio_value") {
    if (record) appendFileSync(record, JSON.stringify({ event: "call", valid }) + "\n");
    result = { content: [{ type: "text", text: valid ? "MCP_MANAGER_STDIO_VERIFIED" : "INVALID_FIXTURE_ARGUMENTS_OR_ENV" }], isError: !valid };
  } else if (message.method === "ping") result = {};
  else { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32601, message: "Method not found" } }) + "\n"); return; }
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }) + "\n");
});
