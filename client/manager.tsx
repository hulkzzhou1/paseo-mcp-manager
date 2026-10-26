import { useState } from "react";
import { Text, View } from "react-native";
import { useSettings, type PluginScreenProps, type SettingsState } from "@getpaseo/plugin/client";
import { ScrollView, SettingsAction, SettingsCard, SettingsInput, SettingsRow, SettingsSection, SettingsSelect, SettingsSwitch, TextInput } from "@getpaseo/plugin/client/ui";
import { connection, services, type ServiceValues } from "../shared/services.ts";

type Settings = SettingsState<typeof services.schema>;
type Ready = Extract<Settings, { status: "ready" }>;
type Draft = { originalName: string | null; values: ServiceValues; revision: string };

function ServiceEditor({ draft, settings, theme, onClose }: { draft: Draft; settings: Settings; theme: PluginScreenProps["theme"]; onClose(): void }) {
  const initial = draft.originalName === null ? undefined : draft.values.services[draft.originalName];
  const [base, setBase] = useState(draft);
  const [name, setName] = useState(draft.originalName ?? "");
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [url, setUrl] = useState(initial?.config.url ?? "");
  const [headers, setHeaders] = useState(JSON.stringify(initial?.config.headers ?? {}, null, 2));
  const [alwaysLoad, setAlwaysLoad] = useState<"default" | "true" | "false">(initial?.config.alwaysLoad === undefined ? "default" : String(initial.config.alwaysLoad) as "true" | "false");
  const [mode, setMode] = useState<"form" | "json">("form");
  const [json, setJson] = useState("");
  const [error, setError] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  const blocked = settings.saving || settings.status !== "ready";
  const textStyle = { color: theme.colors.foreground };
  const jsonStyle = { minHeight: 140, padding: 12, color: theme.colors.foreground, backgroundColor: theme.colors.surface0 };

  const parse = () => {
    try {
      const value: unknown = mode === "json" ? JSON.parse(json) : { type: "http", url: url.trim(), headers: JSON.parse(headers), ...(alwaysLoad === "default" ? {} : { alwaysLoad: alwaysLoad === "true" }) };
      const result = connection.safeParse(value);
      if (result.success) return result.data;
    } catch {}
    setError("Use a valid HTTP/HTTPS URL, string header values and optional boolean alwaysLoad. Unknown fields and unsupported transports are rejected. Check JSON syntax if using JSON.");
  };
  const switchMode = () => {
    setError("");
    const value = parse();
    if (!value) return;
    if (mode === "form") { setJson(JSON.stringify(value, null, 2)); setMode("json"); }
    else {
      setUrl(value.url);
      setHeaders(JSON.stringify(value.headers ?? {}, null, 2));
      setAlwaysLoad(value.alwaysLoad === undefined ? "default" : value.alwaysLoad ? "true" : "false");
      setMode("form");
    }
  };
  const save = async () => {
    setError("");
    const key = name.trim();
    if (key !== base.originalName && Object.hasOwn(base.values.services, key)) { setError("A service with this name already exists. Choose another name."); return; }
    const config = parse();
    if (!config) return;
    const next = { ...base.values.services };
    if (base.originalName !== null) delete next[base.originalName];
    const parsed = services.schema.safeParse({ services: { ...next, [key]: { enabled, config } } });
    if (!parsed.success) { setError("Names must contain letters, numbers, hyphens or underscores. paseo and JavaScript prototype names are reserved."); return; }
    if (await settings.save(parsed.data, base.revision)) onClose();
    else setSaveFailed(true);
  };
  return <SettingsSection title={draft.originalName === null ? "Add HTTP service" : `Edit ${draft.originalName}`}>
    <SettingsCard>
      <SettingsInput label="Service name" initialValue={name} onChangeText={setName} disabled={blocked} placeholder="search" />
      <SettingsSwitch label="Enabled for new agents" value={enabled} onValueChange={setEnabled} disabled={blocked} />
      <SettingsAction label="Connection editor" actionLabel={mode === "form" ? "Edit JSON" : "Use form"} disabled={blocked} onPress={switchMode} />
      {mode === "json" ? <SettingsRow label="Connection JSON" hint="The name and enabled state are managed separately. Only supported connection fields are accepted.">
        <TextInput accessibilityLabel="Connection JSON" multiline value={json} onChangeText={setJson} editable={!blocked} autoCapitalize="none" autoCorrect={false} style={jsonStyle} />
      </SettingsRow> : <View key="form">
        <SettingsInput label="URL" initialValue={url} onChangeText={setUrl} disabled={blocked} placeholder="https://example.com/mcp" />
        <SettingsRow label="Headers (JSON)" hint="Enter tokens directly, including any Bearer prefix. Stored as restricted local JSON and readable by authorized editing clients.">
          <TextInput accessibilityLabel="HTTP headers JSON" multiline value={headers} onChangeText={setHeaders} editable={!blocked} autoCapitalize="none" autoCorrect={false} style={jsonStyle} />
        </SettingsRow>
        <SettingsSelect<"default" | "true" | "false"> label="Tool loading" value={alwaysLoad} options={[{ label: "Provider default", value: "default" }, { label: "Always load", value: "true" }, { label: "On demand", value: "false" }]} onValueChange={setAlwaysLoad} disabled={blocked} />
      </View>}
      <SettingsAction label="Apply to future agents" actionLabel={settings.saving ? "Saving…" : "Save service"} disabled={blocked} onPress={() => void save()} />
      <SettingsAction label="Discard draft" actionLabel="Cancel" disabled={settings.saving} onPress={onClose} />
    </SettingsCard>
    {error ? <Text accessibilityRole="alert" style={textStyle}>{error}</Text> : null}
    {saveFailed ? <View style={{ gap: 8 }}>
      <Text accessibilityRole="alert" style={textStyle}>Save failed or another client changed the settings. Your draft is preserved. Reload, review the current list, then explicitly use that version with your draft before retrying. Saving will replace this service; other services use the reloaded version.</Text>
      <SettingsAction label="Keep this draft and read current settings" actionLabel="Reload saved version" disabled={settings.saving} onPress={() => void settings.reload()} />
      <SettingsAction label="Use the displayed saved version as the base for this draft" actionLabel="Use latest version with draft" disabled={blocked} onPress={() => {
        if (settings.status === "ready") { setBase({ ...base, values: settings.values, revision: settings.revision }); setSaveFailed(false); }
      }} />
    </View> : null}
  </SettingsSection>;
}

export function Manager({ theme, layout }: PluginScreenProps) {
  const settings = useSettings(services);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deletion, setDeletion] = useState<{ name: string; base: Ready } | null>(null);
  const [notice, setNotice] = useState("");
  const text = { color: theme.colors.foreground };
  const start = (name: string | null) => {
    if (settings.status === "ready") { setDraft({ originalName: name, values: settings.values, revision: settings.revision }); setNotice(""); }
  };
  const toggle = async (name: string) => {
    if (settings.status !== "ready") return;
    const item = settings.values.services[name]!;
    const ok = await settings.save({ services: { ...settings.values.services, [name]: { ...item, enabled: !item.enabled } } }, settings.revision);
    setNotice(ok ? "Saved for new agents." : "Save failed or settings changed. Reload before retrying; nothing was overwritten.");
  };
  const remove = async () => {
    if (!deletion) return;
    const next = { ...deletion.base.values.services };
    delete next[deletion.name];
    if (await settings.save({ services: next }, deletion.base.revision)) { setDeletion(null); setNotice("Service deleted for new agents."); }
    else setNotice("Delete failed or settings changed. Cancel this confirmation and reload before trying again.");
  };
  return <ScrollView style={{ flex: 1, backgroundColor: theme.colors.surface0 }} contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 20 }}>
    <View style={{ gap: 6 }}>
      <Text accessibilityRole="header" style={{ ...text, fontSize: 24, fontWeight: "600" }}>MCP connections</Text>
      <Text style={{ color: theme.colors.foregroundMuted }}>Saved connections apply only to new agents. Existing agents keep their configuration.</Text>
      <Text style={{ color: theme.colors.foregroundMuted }}>HTTP · Codex. Enabled means configured, not connected. Saving does not contact services.</Text>
    </View>
    {settings.status === "loading" ? <Text style={text}>Loading connections…</Text> : settings.status !== "ready" ? <SettingsSection title={settings.status === "invalid" ? "Saved configuration is invalid" : "Unable to read connections"}>
      <Text accessibilityRole="alert" style={text}>{settings.status === "invalid" ? "The saved values do not match the configuration format. Correct the stored configuration before creating agents. Your data has not been reset." : "The daemon could not be reached or the read failed. Reconnect and try again. Your data has not been reset."}</Text>
      <SettingsAction label="Read saved configuration again" actionLabel="Reload" onPress={() => void settings.reload()} />
    </SettingsSection> : <SettingsSection title={`Services (${Object.keys(settings.values.services).length})`}>
      {!Object.keys(settings.values.services).length ? <Text style={text}>No services yet. Add an HTTP connection to get started.</Text> : Object.entries(settings.values.services).map(([name, value]) => <SettingsCard key={name}>
        <SettingsRow label={name} hint={`HTTP · ${value.enabled ? "Enabled for new agents" : "Disabled"}`} />
        <SettingsSwitch label={`Enable ${name}`} value={value.enabled} disabled={settings.saving || !!draft || !!deletion} onValueChange={() => void toggle(name)} />
        <SettingsAction label={`Edit ${name}`} actionLabel="Edit service" disabled={settings.saving || !!draft || !!deletion} onPress={() => start(name)} />
        <SettingsAction label={`Remove ${name}`} actionLabel="Delete service" disabled={settings.saving || !!draft || !!deletion} onPress={() => { setDeletion({ name, base: settings }); setNotice(""); }} />
      </SettingsCard>)}
      {!draft && !deletion ? <SettingsAction label="Connect an external tool service" actionLabel="Add HTTP service" disabled={settings.saving} onPress={() => start(null)} /> : null}
      <SettingsAction label="Read current saved configuration" actionLabel="Reload" disabled={settings.saving} onPress={() => void settings.reload()} />
    </SettingsSection>}
    {draft ? <ServiceEditor draft={draft} settings={settings} theme={theme} onClose={() => setDraft(null)} /> : null}
    {deletion ? <SettingsSection title={`Delete ${deletion.name}?`}>
      <Text style={text}>This removes its saved definition. Existing agents keep their configuration.</Text>
      <SettingsAction label="Remove the saved definition" actionLabel="Confirm deletion" disabled={settings.saving || settings.status !== "ready"} onPress={() => void remove()} />
      <SettingsAction label="Keep the service" actionLabel="Cancel deletion" disabled={settings.saving} onPress={() => setDeletion(null)} />
    </SettingsSection> : null}
    {notice ? <Text accessibilityRole="alert" style={text}>{notice}</Text> : null}
  </ScrollView>;
}
