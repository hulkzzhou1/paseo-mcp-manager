import { useState } from "react";
import { Pressable, Text } from "react-native";
import type { PluginScreenProps } from "@getpaseo/plugin/client";

export function Action({ theme, label, accessibilityLabel = label, primary = false, danger = false, disabled = false, onPress }: {
  theme: PluginScreenProps["theme"]; label: string; accessibilityLabel?: string;
  primary?: boolean; danger?: boolean; disabled?: boolean; onPress(): void;
}) {
  const [focused, setFocused] = useState(false);
  const colors = theme.colors;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: focused ? (primary ? colors.foreground : colors.accent) : "transparent", backgroundColor: primary ? colors.accent : "transparent", opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}>
    <Text style={{ color: primary ? colors.accentForeground : danger ? colors.statusDanger : colors.foreground, fontSize: 14, fontWeight: primary ? "600" : "400" }}>{label}</Text>
  </Pressable>;
}
