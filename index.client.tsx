import type { PluginClientContext, PluginSidebarItemProps } from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { Manager } from "./client/manager.tsx";

function Navigation({ currentScreen, openScreen }: PluginSidebarItemProps) {
  return <SidebarRow icon="Cable" active={currentScreen?.screenId === "main"} onPress={() => openScreen({ screenId: "main" })} />;
}

export default function contribute(client: PluginClientContext) {
  client.addScreen({ id: "main", title: "MCP Manager", Component: Manager });
  client.addSidebarFooterItem({ id: "main", title: "MCP Manager", Component: Navigation });
  return () => {};
}
