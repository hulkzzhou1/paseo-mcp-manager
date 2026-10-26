# MCP Manager for Paseo

Manage HTTP and stdio MCP services for **new Codex and Claude agents**, including provider aliases. Uses public community Paseo plugin interfaces; requires daemon and client 0.13.2 or later.

[中文介绍](OVERVIEW.zh-CN.md) · [Plugin overview](OVERVIEW.md) · [Specification](https://github.com/hulkzzhou1/paseo-mcp-manager/issues/1)

## Install and use

Enable trusted plugins on your daemon, then install the public source:

```bash
paseo plugin install github:hulkzzhou1/paseo-mcp-manager --ref v0.1.1
```

Open **MCP Manager** in the sidebar. Connections appear as responsive cards; add and edit open a modal dialog. The interface follows the Paseo app language (English or Simplified Chinese, with English fallback). See the [bilingual message table](docs/translations.md). Add a service, select HTTP or stdio, enter its values, then save. Create a new Codex or Claude agent to use its tools. Saving does not connect, launch commands or verify credentials.

- HTTP: HTTP/HTTPS URL and optional string-valued headers, including the complete authentication prefix.
- stdio: executable command, a JSON array of argument strings, and a string-valued environment map. Commands run on the daemon in the agent's context; arguments are not split or evaluated as shell text.
- Form and connection JSON modes support `alwaysLoad`; names and enabled state are managed separately.
- An agent's explicit same-named definition wins in full. Existing agents are unchanged when services or tokens change.
- Stale saves are rejected. Keep the draft, reload, and explicitly adopt the latest version before saving again.

Tokens are literal headers/env values in ordinary host-scoped JSON (restricted file permissions). Authorized editing clients can read them. Providers receive connection configuration; HTTP services receive the configured headers, and stdio processes receive the configured env. Replace expired tokens manually. Plugin reload, disable/re-enable and daemon restart preserve settings; **uninstall deletes the installation's settings**.

The first release covers HTTP/stdio with Codex and Claude. OAuth, token-file lookup, SSE editing, other providers and live updates to existing agents are outside its scope.

## Move from a temporary injector

1. On the daemon machine, review which temporary connections are still needed. Keep actual URLs, paths and credentials on that machine.
2. Review any independent browser-discovery or prompt guidance in the old plugin. Arrange a separate replacement if it is still needed; MCP Manager only manages connections.
3. Enter each required definition in MCP Manager. If the old plugin reads a token file, enter the current token directly in headers/env instead of copying the file-reading logic.
4. Remove overlapping injection from the old plugin before testing manager edits or disable switches. A second injector can supply the same name and hide the manager's changes.
5. Verify replacement tools with new agents. Disable the temporary plugin once all required connections and independent guidance have a replacement. Preserve any needed configuration before removing an installation.

MCP Manager does not copy production definitions, alter old agents, read credential files or automatically disable other plugins.

## Development and verification

Use Node.js 24 and a community Paseo CLI on PATH:

```bash
npm install --include=dev
npm run typecheck
npm test
npm run test:integration
```

The integration suite starts and cleans up an isolated, loopback-only daemon. It checks public settings RPCs, revision conflicts, lifecycle retention, uninstall behavior and a dummy legacy cutover without touching the daily daemon. Optional real-provider acceptance requires existing provider authentication and incurs provider usage:

```bash
PASEO_TEST_PROVIDER=codex npm run test:integration
PASEO_TEST_PROVIDER=claude npm run test:integration
PASEO_TEST_PROVIDER=all npm run test:integration
```

`all` checks Codex, Claude and a representative Codex alias, each calling local HTTP and stdio fixtures. If your Claude gateway requires a specific model, set `PASEO_TEST_CLAUDE_MODEL` to one available to your account; this changes only the disposable test agent. Fixtures use fake tokens; stdio verifies argument strings and environment values. Tests and development dependencies are excluded from the package contents. See [validation notes](docs/validation.md) for the recorded release checks.
