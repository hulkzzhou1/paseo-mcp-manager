# MCP Manager

Manage HTTP and stdio MCP connections from a Paseo sidebar screen. Add, edit, rename, enable, disable or delete services using a form or a single-service JSON editor. Each daemon keeps its own definitions.

Connections appear as cards, with add and edit forms in a modal dialog. The interface follows the app language: English and Simplified Chinese are included; other languages fall back to English.

Saved, enabled connections are supplied to newly created Codex and Claude agents, including custom providers whose inheritance resolves to either provider. An agent's explicit connection takes precedence over a managed service with the same name. Existing agents keep their configuration, including when resumed. Enabled means configured, not connected; saving validates values without contacting a service or starting a command.

Requires community Paseo 0.13.2 or later on both the daemon and client, and a configured, authenticated Codex or Claude provider. HTTP services need a URL and optional string headers. Stdio services need an executable available on the daemon, optional arguments and environment values; they run in the agent's execution context. Argument strings are preserved without shell splitting. The optional `alwaysLoad` setting remains provider dependent.

Enter tokens directly in headers or environment values, including any required authentication prefix. They are stored as ordinary host-side JSON protected by file permissions, not encrypted secret storage. Authorized editing clients can read complete values. Connection configuration is passed to the selected provider; HTTP requests send configured headers to the service, and stdio processes receive configured environment values. Lists and plugin diagnostics omit connection values. Replace expired tokens manually for future agents.

Conflicting saves preserve the draft and reject the stale write. Reload the current settings, then explicitly adopt that version with your draft before retrying. Reload, disable/re-enable and daemon restart retain settings. Uninstalling the plugin deletes that installation's settings, so preserve needed definitions first.
