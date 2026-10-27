import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useTranslation } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/ui";
import { Action } from "./action.tsx";
import { messages } from "./messages.ts";

export function ServiceRow({ theme, compact, name, transport, enabled, disabled, onEdit, onToggle, onDelete }: {
  theme: PluginScreenProps["theme"]; compact: boolean; name: string; transport: "http" | "stdio";
  enabled: boolean; disabled: boolean; onEdit(): void; onToggle(): void; onDelete(): void;
}) {
  const { t } = useTranslation(messages);
  const [hovered, setHovered] = useState(false);
  const c = theme.colors;
  return <View testID="service-row" style={{ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, backgroundColor: hovered ? c.surface2 : c.surface1 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={t("editNamed", { name })} accessibilityHint={`${transport === "http" ? "HTTP" : "stdio"} · ${t(enabled ? "enabled" : "disabled")}`} disabled={disabled} accessibilityState={{ disabled }}
      onPress={() => { setHovered(false); onEdit(); }} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
      style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 56, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: "transparent", opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}>
      <Icon name="ChevronRight" size={14} color={c.foregroundMuted} />
      <Icon name={transport === "http" ? "Cable" : "Terminal"} size={18} color={c.foreground} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: compact ? "column" : "row", alignItems: compact ? "stretch" : "center", gap: compact ? 2 : 8, paddingVertical: 8 }}>
        <Text numberOfLines={1} style={{ color: c.foreground, fontSize: 14, lineHeight: 20, flexShrink: 1 }}>{name}</Text>
        <Text numberOfLines={1} style={{ color: c.foregroundMuted, fontSize: 13, lineHeight: 18 }}>{transport === "http" ? "HTTP" : "stdio"} · {t(enabled ? "enabled" : "disabled")}</Text>
      </View>
    </Pressable>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      {/* The SDK exposes switches only inside full settings rows; keep Providers' 34×20 geometry here. */}
      <Pressable accessibilityRole="switch" accessibilityLabel={t("enableNamed", { name })} accessibilityState={{ checked: enabled, disabled }} aria-checked={enabled} disabled={disabled}
        onPress={onToggle}
        style={{ width: 44, height: 44, justifyContent: "center", alignItems: "center", borderRadius: 6, borderWidth: 1, borderColor: "transparent", opacity: disabled ? 0.5 : 1 }}>
        <View style={{ width: 34, height: 20, borderRadius: 10, padding: 2, backgroundColor: enabled ? c.accent : c.border }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, alignSelf: enabled ? "flex-end" : "flex-start", backgroundColor: c.accentForeground }} />
        </View>
      </Pressable>
      <Action theme={theme} label={t("removeNamed", { name })} icon="Trash2" iconOnly danger disabled={disabled} onPress={onDelete} />
    </View>
  </View>;
}
