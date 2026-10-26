# v0.1.0 validation

Recorded 2026-10-27 against community Paseo 0.13.2 and Node.js 24.18.0. Tests used disposable daemons and fake MCP credentials. The daily daemon and its production MCP definitions were not changed.

## Automated checks

- `npm run typecheck`: passed.
- `npm test`: eight public settings/creation-contract tests passed. Covers validation, HTTP/stdio mixtures, exact argument strings, disabled filtering, full explicit overrides, request immutability, sanitized failures, provider roots/aliases, unknown/cyclic inheritance, and creation snapshots across edit, rename, token rotation, disable/re-enable and delete. Only `agent.create` is registered; there is no resume injection.
- Default integration suite: passed; paid provider checks skip unless explicitly selected. Installs the real plugin in a fresh daemon, exercises public settings RPCs and stale/invalid writes, then verifies reload, disable/re-enable, daemon restart and uninstall/reinstall behavior.
- Full provider suite: five checks passed in 59.1 seconds. Codex, Claude and a Codex alias each called both local authenticated HTTP and stdio fixtures. Assertions require actual fixture calls; model text alone does not pass. Stdio verifies literal argument strings and env token. Save creates neither HTTP traffic nor a stdio process.
- Claude acceptance used an explicitly selected model available through the locally configured gateway. The gateway rejected the community default model, so the test-only `PASEO_TEST_CLAUDE_MODEL` override was used. No daily provider configuration was changed.
- Disposable legacy injector plus capture hook: passed. An overlapping old definition hides a manager disable; disabling the old injector removes it; re-enabling the managed definition supplies the new value. The capture fixture aborts before provider construction, so the rehearsal never connects to its dummy URLs.
- Two-axis reviews for each implementation slice: no remaining Standards or Spec findings. The first Spec review's invalid/error display finding was fixed before proceeding.

## Interface checks

Used the actual community web client and installed plugin, via an isolated test daemon:

- Opened the sidebar screen, observed the empty list, entered a fake HTTP token through page inputs and saved; a subsequently created Codex agent returned the actual fixture marker.
- Edited HTTP values, replaced a fake token, renamed a service, toggled enabled state, cancelled a deletion and confirmed deletion.
- Caused a concurrent settings write while an editor was open. The stale save was rejected, the draft stayed mounted across reload, and an explicit choice of the latest base allowed saving without removing the other client's service.
- Switched HTTP and stdio between form and JSON; `alwaysLoad`, exact args strings and env values survived. Invalid JSON stayed visible with an error when switching back was attempted. Cancelling an editor retained saved values.
- Temporarily supplied malformed stored values in the disposable daemon. The page displayed “Saved configuration is invalid” and retained the active draft. The malformed file was not reset automatically.
- Temporarily denied read access to that disposable settings file. The page displayed the separate “Unable to read connections” state; restoring access and reloading recovered the saved definitions.
- Checked wide (1000px) and compact (390px) layouts, light and dark themes, named input/switch controls, scrolling and no horizontal document overflow. Restored the prior System theme afterward. Screenshots in `assets/` show real compact UI with sample service names and no connection values.

These are web-client checks. Physical iOS/Android keyboard and screen-reader testing was not performed. Provider connectivity and authentication still depend on the user's configured provider, executable and MCP service.

## Publication

The plugin is distributed as public Git source with a pinned release tag. It needs no build commands or runtime dependency installation; Paseo supplies SDK, React and Zod. The package allowlist excludes tests and development dependencies. The manifest declares English and Chinese listing text, minimum Paseo version, and real interface media.

Public-source installation and community-registry status are tracked in the release and submission records. A submission alone does not establish community acceptance.
