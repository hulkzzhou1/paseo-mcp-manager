import { useState } from "react";
import { Text, View } from "react-native";
import { useSettings, type PluginScreenProps, type SettingsState } from "@getpaseo/plugin/client";
import { ScrollView, SettingsAction, SettingsCard, SettingsInput, SettingsRow, SettingsSection, TextInput } from "@getpaseo/plugin/client/ui";
import { services } from "../shared/services.ts";

type Ready = Extract<SettingsState<typeof services.schema>, { status: "ready" }>;

function AddService({ settings, theme, onClose }: { settings: Ready; theme: PluginScreenProps["theme"]; onClose(): void }) {
  const [base] = useState(() => ({ values: settings.values, revision: settings.revision }));
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{}");
  const [error, setError] = useState("");
  const save = async () => {
    setError("");
    const key = name.trim();
    if (Object.hasOwn(base.values.services, key)) { setError("A service with this name already exists."); return; }
    let values: unknown;
    try { values = { services: { ...base.values.services, [key]: { enabled: true, config: { type: "http", url: url.trim(), headers: JSON.parse(headers) } } } }; }
    catch { setError("Headers must be a JSON object containing string values."); return; }
    const parsed = services.schema.safeParse(values);
    if (!parsed.success) { setError("Check the name, HTTP URL and header values. Service names use letters, numbers, hyphens or underscores; paseo is reserved."); return; }
    if (await settings.save(parsed.data, base.revision)) onClose();
  };
  return <SettingsSection title="Add HTTP service">
    <SettingsCard>
      <SettingsInput label="Service name" onChangeText={setName} disabled={settings.saving} placeholder="search" />
      <SettingsInput label="URL" onChangeText={setUrl} disabled={settings.saving} placeholder="https://example.com/mcp" />
      <SettingsRow label="Headers (JSON)" hint="Enter tokens directly, including any Bearer prefix. Values are stored on this daemon and can be viewed while editing.">
        <TextInput accessibilityLabel="HTTP headers JSON" multiline value={headers} onChangeText={setHeaders} editable={!settings.saving} autoCapitalize="none" autoCorrect={false} style={{ minHeight: 110, padding: 12, color: theme.colors.foreground, backgroundColor: theme.colors.surface0 }} />
      </SettingsRow>
      <SettingsAction label="Save for new agents" actionLabel={settings.saving ? "Saving…" : "Save service"} disabled={settings.saving} onPress={() => void save()} />
      <SettingsAction label="Discard draft" actionLabel="Cancel" disabled={settings.saving} onPress={onClose} />
    </SettingsCard>
    {(error || settings.saveError) ? <Text accessibilityRole="alert" style={{ color: theme.colors.foreground }}>{error || "Save failed or another client changed the settings. Your draft is preserved. Cancel and reload before retrying."}</Text> : null}
  </SettingsSection>;
}

export function Manager({ theme, layout }: PluginScreenProps) {
  const settings = useSettings(services);
  const [adding, setAdding] = useState(false);
  const text = { color: theme.colors.foreground };
  return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 20 }}>
    <View style={{ gap: 6 }}>
      <Text accessibilityRole="header" style={{ ...text, fontSize: 24, fontWeight: "600" }}>MCP connections</Text>
      <Text style={{ color: theme.colors.foregroundMuted }}>Saved connections apply only to new agents. Existing agents keep their configuration.</Text>
      <Text style={{ color: theme.colors.foregroundMuted }}>Initial preview: HTTP · Codex. Enabled means configured, not connected.</Text>
    </View>
    {settings.status === "loading" ? <Text style={text}>Loading connections…</Text> : settings.status !== "ready" ? <SettingsSection title={settings.status === "invalid" ? "Saved configuration is invalid" : "Unable to read connections"}>
      <Text accessibilityRole="alert" style={text}>{settings.status === "invalid" ? "The saved values do not match the configuration format. Correct the stored configuration before creating agents. Your data has not been reset." : "The daemon could not be reached or the read failed. Reconnect and try again. Your data has not been reset."}</Text>
      <SettingsAction label="Read saved configuration again" actionLabel="Reload" onPress={() => void settings.reload()} />
    </SettingsSection> : <>
      <SettingsSection title={`Services (${Object.keys(settings.values.services).length})`}>
        {!Object.keys(settings.values.services).length ? <Text style={text}>No services yet. Add an HTTP connection to get started.</Text> : <SettingsCard>
          {Object.entries(settings.values.services).map(([name, value]) => <SettingsRow key={name} label={name} hint={`HTTP · ${value.enabled ? "Enabled for new agents" : "Disabled"}`} />)}
        </SettingsCard>}
        {!adding ? <SettingsAction label="Connect an external tool service" actionLabel="Add HTTP service" onPress={() => setAdding(true)} /> : null}
      </SettingsSection>
      {adding ? <AddService settings={settings} theme={theme} onClose={() => { setAdding(false); void settings.reload(); }} /> : null}
    </>}
  </ScrollView>;
}
