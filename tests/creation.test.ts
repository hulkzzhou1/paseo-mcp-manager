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

test("the public save and create flow preserves stdio arguments and credentials alongside HTTP definitions", async () => {
  let definition: any;
  let before: any;
  let saved: unknown;
  contribute({ registerSettings(value: any) { definition = value; return { read: async () => ({ status: "ready", values: saved }) }; }, before(_name: string, callback: any) { before = callback; return () => {}; } } as any);
  const config = { type: "stdio", command: "node", args: ["fixture.mjs", "one argument", "$(not-a-command); 'quoted'", ""], env: { TOKEN: "literal-token-value", VALUE: " spaces preserved " }, alwaysLoad: false };
  saved = definition.schema.parse({ services: {
    local: { enabled: true, config },
    remote: { enabled: true, config: { type: "http", url: "https://example.com/mcp" } },
    off: { enabled: false, config },
  } });
  const result = await before({ request: { config: { provider: "codex", cwd: "/project" } } }, {});
  assert.deepEqual(result.config.mcpServers.local, config);
  assert.equal(result.config.mcpServers.remote.type, "http");
  assert.equal(Object.hasOwn(result.config.mcpServers, "off"), false);
  for (const invalid of [{ ...config, command: " " }, { ...config, args: [1] }, { ...config, env: { TOKEN: 12 } }, { ...config, cwd: "/other" }]) {
    assert.equal(definition.schema.safeParse({ services: { local: { enabled: true, config: invalid } } }).success, false);
  }
});

test("edits, token rotation, rename, switches and deletion change only subsequent creation snapshots", async () => {
  let definition: any;
  let before: any;
  let saved: any;
  const hooks: string[] = [];
  contribute({ registerSettings(value: any) { definition = value; return { read: async () => ({ status: "ready", values: saved }) }; }, before(name: string, callback: any) { hooks.push(name); before = callback; return () => {}; } } as any);
  const save = (services: unknown) => { saved = definition.schema.parse({ services }); };
  const create = () => before({ request: { config: { provider: "codex", cwd: "/project" } } }, {});
  const initial = { enabled: true, config: { type: "http", url: "https://example.com/first", headers: { Authorization: "Bearer first-token" } } };
  save({ search: initial });
  const agentA = await create();
  save({ renamed: { ...initial, config: { ...initial.config, url: "https://example.com/second", headers: { Authorization: "Bearer replacement-token" } } } });
  const agentB = await create();
  assert.deepEqual(agentB.config.mcpServers, { renamed: saved.services.renamed.config });
  save({ renamed: { ...saved.services.renamed, enabled: false } });
  assert.equal((await create()).config.mcpServers, undefined);
  save({ renamed: { ...saved.services.renamed, enabled: true } });
  assert.equal((await create()).config.mcpServers.renamed.headers.Authorization, "Bearer replacement-token");
  save({});
  assert.equal((await create()).config.mcpServers, undefined);
  assert.deepEqual(agentA.config.mcpServers, { search: initial.config });
  assert.equal(agentB.config.mcpServers.renamed.headers.Authorization, "Bearer replacement-token");
  assert.deepEqual(hooks, ["agent.create"], "Resuming an agent has no manager hook to rerun");
});

test("Codex and Claude roots and inherited aliases share filtering and explicit precedence", async () => {
  let definition: any;
  let before: any;
  let saved: any;
  contribute({ registerSettings(value: any) { definition = value; return { read: async () => ({ status: "ready", values: saved }) }; }, before(_name: string, callback: any) { before = callback; return () => {}; } } as any);
  saved = definition.schema.parse({ services: {
    local: { enabled: true, config: { type: "stdio", command: "node", args: ["space here"], env: { TOKEN: "fake-token" } } },
    same: { enabled: true, config: { type: "http", url: "https://example.com/managed", headers: { Authorization: "managed" } } },
    off: { enabled: false, config: { type: "http", url: "https://example.com/off" } },
  } });
  const context = { paseo: { config: { get: async () => ({ config: { providers: { codex_alias: { extends: "codex_chain" }, codex_chain: { extends: "codex" }, claude_alias: { extends: "claude" } } } }) } } };
  for (const provider of ["codex", "claude", "codex_alias", "claude_alias"]) {
    const request = { config: { provider, cwd: "/project", systemPrompt: "unchanged", mcpServers: { same: { type: "http", url: "https://example.com/explicit" } } }, env: { KEEP: "unchanged" } };
    const original = structuredClone(request);
    const result = await before({ request }, context);
    assert.deepEqual(result.config.mcpServers, { local: saved.services.local.config, same: original.config.mcpServers.same });
    assert.equal(result.config.systemPrompt, original.config.systemPrompt);
    assert.deepEqual(result.env, original.env);
    assert.deepEqual(request, original);
  }
});

test("unresolved and cyclic aliases skip injection with sanitized reasons", async () => {
  let before: any;
  contribute({ registerSettings() { return { read() { assert.fail("Invalid inheritance must not read managed connections"); } }; }, before(_name: string, callback: any) { before = callback; return () => {}; } } as any);
  const warnings: unknown[][] = [];
  const warn = console.warn;
  console.warn = (...args) => { warnings.push(args); };
  try {
    const context = { paseo: { config: { get: async () => ({ config: { providers: { a: { extends: "b", env: { TOKEN: "private-value" } }, b: { extends: "a" }, missing: { extends: "unknown" } } } }) } } };
    for (const provider of ["a", "missing", "unknown"]) {
      const request = { config: { provider, cwd: "/project" } };
      assert.equal(await before({ request }, context), request);
    }
    assert.equal(warnings.length, 3);
    assert.equal(JSON.stringify(warnings).includes("private-value"), false);
    assert.match(JSON.stringify(warnings), /cycle/);
    assert.match(JSON.stringify(warnings), /unresolved/);
  } finally { console.warn = warn; }
});
