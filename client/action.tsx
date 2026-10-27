import { useState } from "react";
import { Pressable, Text } from "react-native";
import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/ui";

export function Action({ theme, label, accessibilityLabel = label, icon, iconOnly = false, primary = false, danger = false, disabled = false, onPress }: {
  theme: PluginScreenProps["theme"]; label: string; accessibilityLabel?: string; icon?: string; iconOnly?: boolean;
  primary?: boolean; danger?: boolean; disabled?: boolean; onPress(): void;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const c = theme.colors;
  const color = primary ? c.accentForeground : danger ? c.statusDanger : iconOnly && !hovered && !focused ? c.foregroundMuted : c.foreground;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} hitSlop={6}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    style={({ pressed }) => ({ minHeight: 32, minWidth: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: iconOnly ? 6 : 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1,
      borderColor: focused ? (primary ? c.foreground : c.accent) : iconOnly || primary ? "transparent" : c.border,
      backgroundColor: primary ? c.accent : hovered ? c.surface2 : "transparent", opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}>
    {icon ? <Icon name={icon} size={16} color={color} /> : null}
    {!iconOnly ? <Text style={{ color, fontSize: 14, lineHeight: 18, fontWeight: primary ? "600" : "400" }}>{label}</Text> : null}
  </Pressable>;
}
