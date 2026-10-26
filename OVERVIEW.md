# MCP Manager

Manage external MCP connections for new Paseo agents from a sidebar screen.

This development version supports adding HTTP connections for Codex. Save a service name, an HTTP or HTTPS URL, and optional headers. Enter tokens directly in the headers, including any authentication prefix required by the service. Saving validates the definition without contacting the service. The provider connects when a new supported agent is created.

Each daemon stores its own configuration. Existing agents keep the configuration supplied when they were created. An agent's explicit same-named connection takes precedence over the managed definition.

Requires community Paseo 0.13.2 or later and a configured Codex provider. Configuration, including tokens, is stored as ordinary host-side JSON with restricted file permissions. Authorized editing clients can read those values. Connection details and credentials are supplied to the selected provider and configured MCP service; local storage does not keep them exclusively on the host.

Reloading or disabling the plugin preserves its settings. Removing the plugin deletes its settings. The manager does not log in to services or refresh tokens; replace expired values manually for subsequently created agents.
