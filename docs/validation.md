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

Public Git-source installation at commit `b0fc599` passed on a fresh community daemon (15.1 seconds): plugin status was running; settings, revision checks, reload, disable/re-enable, restart and removal checks passed without using local source dependencies.

Community-registry status is tracked in the release and submission records. A submission alone does not establish community acceptance.

# v0.1.1 interface update

Recorded 2026-10-27. Reused Paseo's theme tokens and modal/form components, following the TAPD and Gongfeng plugin interaction patterns. Service cards wrap into two columns on a wide screen and one column on compact screens; add/edit and delete confirmation open host-owned dialogs.

- Typecheck and ten contract/localization tests passed. Catalog keys and interpolation fields match in English and Simplified Chinese. A host translation-runtime test checks app-language changes, translated registration titles, literal service-name interpolation and English fallback.
- Default isolated community-daemon integration passed (two checks; optional paid-provider check skipped). No server creation/injection code changed in this update; the v0.1.0 real-provider acceptance remains the backend evidence.
- Actual web-client checks against a disposable 0.13.2 daemon: Chinese add form saved a fake credential; English edit/cancel retained the saved definition. A concurrent RPC write rejected a stale modal save; the draft survived reload, and explicit adoption of the latest revision saved without removing the other client's service.
- Wide (1200px) cards displayed side by side; compact (390px) cards stacked without horizontal document overflow. English and Chinese listing titles, field labels and actions were checked in the actual app. Release media use sample definitions only.
- Packaging includes the translation catalogs and excludes tests/development dependencies. No new dependencies were added.

Physical iOS/Android keyboard and screen-reader behavior has not been checked. The server-browser plugin was tried first; the local daemon root did not serve a usable web page, so UI checks used the available Paseo app browser connected to the isolated daemon over its relay.

# v0.1.2 Providers layout alignment

Recorded 2026-10-28 against community Paseo 0.13.2. Compared the actual built-in Providers page in the server-browser plugin and its `providers-section.tsx`, settings styles and PageLayout source.

- Replaced the multi-column, two-tier cards with a grouped settings card. Service rows keep edit navigation, name, transport/enable state, switch and delete control together. Rows are 56px minimum (58px with compact two-line metadata), with the same 720px content limit and 16px gutters as Providers.
- Reused the public SettingsSection/Card, Icon and Modal components. Added actions to the section header's trailing slot and moved the expanded usage prose into its information tip. Secondary actions use compact icons with accessible labels; compact add uses a labeled plus icon. Buttons have hover/focus feedback. The standalone switch matches Providers' 34×20 track and 16px thumb because the public SDK exposes only a whole settings row for switches; its interactive area is 44px and exposes checked/disabled state. No animation was introduced.
- Reduced the oversized JSON field minimum to 96px (180px for the full connection editor), with input borders and padding matching host form controls. Existing validation, revision checks, saved-draft recovery and deletion confirmation remain in place. Validation errors now use the danger color; JSON inputs use the host control surface. Ordinary saves preserve the service position instead of moving it to the end; rename still replaces the old key atomically.
- Typecheck and ten contract/localization tests passed. Default isolated-daemon integration passed (two checks; optional paid-provider check skipped). Server injection and shared connection schema are unchanged.
- Actual server-browser checks on a disposable daemon: switch off/on persisted through public settings RPCs; clicking a service name opened the editor; typing a draft and closing with Escape preserved saved values; the Save button persisted a valid form, and a public settings assertion verified the original service order was preserved. Deletion required confirmation: cancel kept all 15 sample entries, confirmation removed only the selected entry (14 remained).
- Checked 1120px desktop layout and 390px/320px compact layouts with 15 fake services, including a long name. Names truncate within their column while switches/actions stay aligned. At 390×844, approximately 12 compact rows are visible. Checked English and Simplified Chinese, light/dark themes, and the compact section information tip. Release media use sample definitions and contain no production configuration.

Paid provider calls were not repeated for this UI-only update. Physical iOS/Android keyboard and screen-reader behavior remains untested.

# v0.1.3 pointer highlight regression

Recorded 2026-10-28 against community Paseo 0.13.2 on a disposable daemon with two fake services.

- Before the fix, clicking a service and cancelling its modal left an accent border even though the row was neither focused nor `:focus-visible`. The browser assertion rejecting any retained row border failed. Opening a modal disables its originating control, so a component-owned focus flag can miss blur.
- Removed the redundant focus flags from service edit controls, switches and shared actions. Keyboard focus uses Paseo's existing `:focus-visible` outline. Pressing an editor/action clears its hover flag before the modal can disable the control. No DOM access, new dependency or settings change was needed.
- After the fix, real pointer clicks opened/cancelled the first, second and first editors in sequence. Moving to the section information button left both edit borders transparent and both row backgrounds equal; hovering the first row changed only its background. The same retained-border assertion passed.
- The server-browser plugin verified real Tab navigation: the service edit button and switch retain the host keyboard outline. The app browser supplied computed-style assertions because server-browser has no DOM-evaluation or hover RPC.
- Typecheck and all ten contract/localization tests passed. This patch changes client interaction only; paid provider calls and physical mobile/screen-reader testing were not repeated.

# v0.1.4 settings navigation

Recorded 2026-10-28 against community Paseo 0.13.2, using the server-browser plugin and a disposable daemon with fake services.

- Replaced the standalone screen and sidebar-footer registration with the public `addSettingsScreen` API, keeping the translated title and Cable icon. The actual workspace sidebar no longer shows MCP Manager; Settings → Plugins → the plugin actions menu exposes MCP Manager and opens its host-scoped settings route.
- The manager accepts `PluginSurfaceProps` and renders content inside Paseo's settings frame. Removed its nested ScrollView and duplicate page padding; the host owns the header, centered column, scrolling and back navigation.
- Checked the actual menu-to-settings navigation at 1120px in the light theme, opened the editor, and saved a valid unchanged sample definition. Public settings assertions verified both services and their original order. At 390×844 in the dark theme, the settings header, compact rows and inline actions remain visible. Release media were refreshed from these real frames and contain sample data only. English and Chinese overview/setup text now describes the settings entry.
- Typecheck and all ten contract/localization tests passed. Settings schema, server hooks, credentials and new-agent injection are unchanged. Paid provider calls and physical mobile/screen-reader testing were not repeated.
