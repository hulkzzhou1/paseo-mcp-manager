import type { PluginServerContext } from "@getpaseo/plugin/server";
import { services } from "./shared/services.ts";

const unsupportedProviders = new Set(["pi", "omp", "copilot", "opencode", "mock", "mock-slow"]);

export default function contribute(server: PluginServerContext) {
  const settings = server.registerSettings(services);
  const remove = server.before("agent.create", async ({ request }, { paseo }) => {
    let provider = request.config.provider;
    if (unsupportedProviders.has(provider)) return request;
    if (provider !== "codex" && provider !== "claude") {
      let config;
      try { ({ config } = await paseo.config.get()); }
      catch { throw new Error("MCP Manager could not read provider inheritance. Check the daemon connection and retry."); }
      const seen = new Set<string>();
      while (provider !== "codex" && provider !== "claude") {
        if (seen.has(provider)) { console.warn("MCP Manager: provider inheritance cycle; managed injection skipped."); return request; }
        seen.add(provider);
        const parent = config.providers?.[provider]?.extends;
        if (typeof parent !== "string" || !parent) { console.warn("MCP Manager: provider inheritance unresolved; managed injection skipped."); return request; }
        if (unsupportedProviders.has(parent)) return request;
        provider = parent;
      }
    }
    let state;
    try { state = await settings.read(); }
    catch { throw new Error("MCP Manager could not read saved settings. Open MCP Manager and retry."); }
    if (state.status !== "ready") throw new Error("MCP Manager settings are invalid. Open MCP Manager to correct them.");
    const enabled = Object.fromEntries(Object.entries(state.values.services)
      .filter(([, service]) => service.enabled).map(([name, service]) => [name, service.config]));
    if (!Object.keys(enabled).length) return request;
    return { ...request, config: { ...request.config, mcpServers: { ...enabled, ...request.config.mcpServers } } };
  });
  return () => remove();
}
