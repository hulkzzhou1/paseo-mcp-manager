import type { PluginServerContext } from "@getpaseo/plugin/server";
export default function contribute(server: PluginServerContext) {
  return server.before("agent.create", ({ request }) => ({ ...request, config: { ...request.config, mcpServers: { local_test: { type: "http", url: "http://127.0.0.1:1/old" }, ...request.config.mcpServers } } }));
}
