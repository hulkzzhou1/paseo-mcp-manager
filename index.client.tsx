import type { PluginClientContext } from "@getpaseo/plugin/client";
import { messages } from "./client/messages.ts";
import { Manager } from "./client/manager.tsx";

export default function contribute(client: PluginClientContext) {
  client.addSettingsScreen({ id: "main", title: messages.message("managerTitle"), icon: "Cable", Component: Manager });
  return () => {};
}
