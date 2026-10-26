import { defineRpc } from "@getpaseo/plugin";
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { z } from "zod";
export default function contribute(server: PluginServerContext) {
  let captured: unknown = null;
  server.handle(defineRpc({ name: "captured", input: z.object({}), output: z.unknown() }), () => captured);
  return server.before("agent.create", ({ request }) => {
    captured = request.config.mcpServers ?? {};
    // Stop before provider construction so cutover rehearsal never connects to either dummy URL.
    throw new Error("MCP_MANAGER_CAPTURE_ONLY");
  });
}
