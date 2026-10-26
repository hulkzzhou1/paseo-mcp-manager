import assert from "node:assert/strict";
import test from "node:test";
import contribute from "../index.server.ts";

test("a saved HTTP service is supplied to a new Codex agent without replacing its explicit connection", async () => {
  let definition: any;
  let before: any;
  let saved: unknown;
  contribute({
    registerSettings(value: any) {
      definition = value;
      return { read: async () => ({ status: "ready", revision: "1", values: saved }) };
    },
    before(name: string, callback: any) {
      assert.equal(name, "agent.create");
      before = callback;
      return () => {};
    },
  } as any);
  // The host validates complete values before making them visible to its read handle.
  saved = definition.schema.parse({ services: {
    search: { enabled: true, config: { type: "http", url: "https://example.com/mcp", headers: { Authorization: "Bearer test-token" } } },
    custom: { enabled: true, config: { type: "http", url: "https://example.com/default" } },
    off: { enabled: false, config: { type: "http", url: "https://example.com/off" } },
  } });
  const request = { config: { provider: "codex", cwd: "/project", systemPrompt: "Keep this prompt", mcpServers: {
    custom: { type: "http", url: "https://example.com/explicit" },
    existing: { type: "http", url: "https://example.com/existing" },
  } }, env: { REGION: "test" } };
  const original = structuredClone(request);
  const result = await before({ request }, {});
  assert.deepEqual(result.config.mcpServers, {
    search: { type: "http", url: "https://example.com/mcp", headers: { Authorization: "Bearer test-token" } },
    custom: { type: "http", url: "https://example.com/explicit" },
    existing: { type: "http", url: "https://example.com/existing" },
  });
  assert.equal(result.config.systemPrompt, "Keep this prompt");
  assert.deepEqual(result.env, { REGION: "test" });
  assert.deepEqual(request, original);
});

test("the settings save contract rejects malformed URLs without throwing or echoing tokens", () => {
  let definition: any;
  contribute({ registerSettings(value: any) { definition = value; return {}; }, before() { return () => {}; } } as any);
  for (const url of ["not-a-url", "ftp://example.com/mcp"]) {
    const result = definition.schema.safeParse({ services: { search: { enabled: true, config: { type: "http", url, headers: { Authorization: "Bearer secret-value" } } } } });
    assert.equal(result.success, false);
    assert.equal(String(result.error).includes("secret-value"), false);
  }
});

test("unsupported providers are left untouched without reading managed settings", async () => {
  let before: any;
  contribute({ registerSettings() { return { read() { assert.fail("Unsupported provider must not read MCP settings"); } }; }, before(_name: string, callback: any) { before = callback; return () => {}; } } as any);
  const request = { config: { provider: "pi", cwd: "/project" } };
  assert.equal(await before({ request }, {}), request);
});

test("a later save affects only subsequent agent creation and invalid storage stops supported creation safely", async () => {
  let before: any;
  let state: any = { status: "ready", values: { services: { search: { enabled: true, config: { type: "http", url: "https://example.com/first" } } } } };
  contribute({ registerSettings() { return { read: async () => state }; }, before(_name: string, callback: any) { before = callback; return () => {}; } } as any);
  const request = { config: { provider: "codex", cwd: "/project" } };
  const first = await before({ request }, {});
  state = { status: "ready", values: { services: { search: { enabled: true, config: { type: "http", url: "https://example.com/second" } } } } };
  const second = await before({ request }, {});
  assert.equal(first.config.mcpServers.search.url, "https://example.com/first");
  assert.equal(second.config.mcpServers.search.url, "https://example.com/second");
  state = { status: "invalid", error: "credential-that-must-not-be-logged" };
  await assert.rejects(before({ request }, {}), (error: Error) => {
    assert.match(error.message, /Open MCP Manager/);
    assert.equal(error.message.includes("credential-that-must-not-be-logged"), false);
    return true;
  });
});
