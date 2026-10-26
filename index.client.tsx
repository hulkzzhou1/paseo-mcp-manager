import type { PluginClientContext, PluginSidebarItemProps } from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { messages } from "./client/messages.ts";
import { Manager } from "./client/manager.tsx";

function Navigation({ currentScreen, openScreen }: PluginSidebarItemProps) {
  return <SidebarRow icon="Cable" active={currentScreen?.screenId === "main"} onPress={() => openScreen({ screenId: "main" })} />;
}

export default function contribute(client: PluginClientContext) {
  client.addScreen({ id: "main", title: messages.message("managerTitle"), Component: Manager });
  client.addSidebarFooterItem({ id: "main", title: messages.message("managerTitle"), Component: Navigation });
  return () => {};
}
