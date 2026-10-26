import assert from "node:assert/strict";
import test from "node:test";
import { spawn, execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { createHostClient } from "@getpaseo/client/node";
import { settingsRpc } from "@getpaseo/plugin";
import { createPaseoApi } from "@getpaseo/client";
import { startHttpMcp } from "../fixtures/http-mcp.ts";

test("an installed community plugin saves validated credentials and rejects stale writes through settings RPC", { timeout: 180_000 }, async (t) => {
  const home = await mkdtemp(join(tmpdir(), "mcp-manager-test-"));
  const listener = createServer();
  await new Promise<void>((done) => listener.listen(0, "127.0.0.1", done));
  const address = listener.address();
  assert(address && typeof address !== "string");
  const port = address.port;
  await new Promise<void>((done) => listener.close(() => done()));
  await writeFile(join(home, "config.json"), JSON.stringify({ version: 1, daemon: { listen: `127.0.0.1:${port}`, relay: { enabled: false } }, pluginsEnabled: true }), { mode: 0o600 });
  const env: NodeJS.ProcessEnv = { ...process.env, PASEO_HOME: home };
  for (const key of ["PASEO_AGENT_ID", "PASEO_AGENT_CWD", "PASEO_HOST", "PASEO_PASSWORD"]) delete env[key];
  let daemon = spawn("paseo", ["daemon", "run", "--home", home], { env, stdio: "ignore" });
  const makeClient = () => createHostClient(`127.0.0.1:${port}`, { clientId: "mcp-manager-integration", clientType: "cli", appVersion: "0.13.2", reconnect: { enabled: false }, localCredential: async () => (await readFile(join(home, "local-credential"), "utf8")).trim() });
  let client = makeClient();
  const ready = async () => {
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/health`);
        const publication = JSON.parse(await readFile(join(home, "paseo.pid"), "utf8"));
        if (response.ok && publication.listen) break;
      } catch {}
      assert.equal(daemon.exitCode, null, "Test daemon exited before becoming ready");
      if (attempt === 99) assert.fail("Test daemon did not become ready");
      await delay(100);
    }
  };
  try {
    await ready();
    await client.connect();
    const plugin = await client.installDirectoryPlugin(resolve("."));
    assert.equal(plugin.status, "running");
    const rpc = settingsRpc("connections");
    const read = () => client.invokePluginRpc("mcp-manager", rpc.read.name, {}).then((v) => rpc.read.output.parse(v));
    const current = await read();
    assert.equal(current.status, "ready");
    if (current.status !== "ready") assert.fail("Expected default settings");
    assert.deepEqual(current.values, { services: {} });
    const values = { services: { local_test: { enabled: true, config: { type: "http", url: "http://127.0.0.1:12345/mcp", headers: { Authorization: "Bearer fake-token" } } } } };
    const write = (revision: string, next: unknown) => client.invokePluginRpc("mcp-manager", rpc.write.name, { revision, values: next }).then((v) => rpc.write.output.parse(v));
    const saved = await write(current.revision, values);
    assert.equal(saved.status, "saved");
    assert.deepEqual((await read()).status, "ready");
    const stale = await write(current.revision, { services: {} });
    assert.equal(stale.status, "conflict");
    const latest = await read();
    assert.equal(latest.status, "ready");
    if (latest.status !== "ready") assert.fail("Expected saved settings");
    assert.deepEqual(latest.values, values);
    const invalid = await write(latest.revision, { services: { bad: { enabled: true, config: { type: "http", url: "invalid" } } } });
    assert.equal(invalid.status, "invalid");
    assert.deepEqual((await read()).status, "ready");
    assert.equal((await client.reloadPlugin("mcp-manager")).status, "running");
    assert.equal((await client.disablePlugin("mcp-manager")).status, "disabled");
    assert.equal((await client.enablePlugin("mcp-manager")).status, "running");
    assert.deepEqual((await read() as { values: unknown }).values, values);
    await client.close();
    execFileSync("paseo", ["daemon", "stop", "--home", home, "--timeout", "10"], { env, stdio: "ignore", timeout: 15_000 });
    daemon = spawn("paseo", ["daemon", "run", "--home", home], { env, stdio: "ignore" });
    await ready();
    client = makeClient();
    await client.connect();
    assert.deepEqual((await read() as { values: unknown }).values, values, "Daemon restart must retain saved settings");
    const logs = await client.getPluginLogs("mcp-manager");
    assert.equal(JSON.stringify(logs).includes("fake-token"), false);
    await t.test("a new Codex agent actually calls authenticated HTTP and stdio tools", { skip: process.env.PASEO_TEST_PROVIDER !== "codex", timeout: 90_000 }, async () => {
      const fixture = await startHttpMcp();
      try {
        const current = await read();
        if (current.status !== "ready") assert.fail("Expected saved settings");
        const record = join(home, "stdio-events.jsonl");
        const configured = await write(current.revision, { services: {
          local_test: { enabled: true, config: { type: "http", url: fixture.url, headers: { Authorization: "Bearer fake-token" } } },
          local_stdio: { enabled: true, config: { type: "stdio", command: process.execPath, args: [resolve("tests/fixtures/stdio-mcp.mjs"), "one argument", "$(literal); 'quoted'", ""], env: { MCP_FIXTURE_TOKEN: "fake-stdio-token", MCP_FIXTURE_RECORD: record } } },
        } });
        assert.equal(configured.status, "saved");
        assert.deepEqual(fixture.requests, [], "Saving configuration must not connect to the MCP service");
        await assert.rejects(readFile(record), { code: "ENOENT" }, "Saving must not launch stdio commands");
        const api = createPaseoApi(client);
        const workspace = await api.workspaces.create({ source: { kind: "directory", path: resolve(".") }, title: "MCP Manager integration" });
        const created = await client.createAgent({ config: { provider: "codex", cwd: resolve("."), modeId: "full-access", title: "HTTP MCP fixture" }, workspaceId: workspace.id });
        const agent = api.agents.ref(created.id);
        await agent.run("Call local_test fixture_value and local_stdio fixture_stdio_value once each, then report their exact outputs. Do not read files, run shell commands, or use other tools.", { timeoutMs: 60_000 });
        assert.ok(fixture.calls.includes("fixture_value"), "The fixture must receive a real tool call; a model response alone is insufficient");
        const events = (await readFile(record, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
        assert.ok(events.some((event) => event.event === "call" && event.valid), "Stdio must receive a real call with exact argument strings and literal env token");
        await agent.archive();
      } finally { await fixture.close(); }
    });
    await client.removePlugin("mcp-manager");
    assert.equal((await client.installDirectoryPlugin(resolve("."))).status, "running");
    assert.deepEqual((await read() as { values: unknown }).values, { services: {} }, "Removal deletes this installation settings");
  } finally {
    await client.close();
    try { execFileSync("paseo", ["daemon", "stop", "--home", home, "--timeout", "10"], { env, stdio: "ignore", timeout: 15_000 }); } finally { daemon.kill(); }
    await rm(home, { recursive: true, force: true });
  }
});
