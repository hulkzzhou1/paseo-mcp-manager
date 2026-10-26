import type { PluginServerContext } from "@getpaseo/plugin/server";
import { services } from "./shared/services.ts";

export default function contribute(server: PluginServerContext) {
  const settings = server.registerSettings(services);
  const remove = server.before("agent.create", async ({ request }) => {
    if (request.config.provider !== "codex") return request;
    const state = await settings.read();
    if (state.status !== "ready") throw new Error("MCP Manager settings are invalid. Open MCP Manager to correct them.");
    const enabled = Object.fromEntries(Object.entries(state.values.services)
      .filter(([, service]) => service.enabled).map(([name, service]) => [name, service.config]));
    if (!Object.keys(enabled).length) return request;
    return { ...request, config: { ...request.config, mcpServers: { ...enabled, ...request.config.mcpServers } } };
  });
  return () => remove();
}
