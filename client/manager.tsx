import { useState } from "react";
import { Text, View } from "react-native";
import { useSettings, useTranslation, type PluginScreenProps, type SettingsState } from "@getpaseo/plugin/client";
import { Modal, ScrollView, SettingsAction, SettingsCard, SettingsInput, SettingsRow, SettingsSection, SettingsSelect, SettingsSwitch, TextInput } from "@getpaseo/plugin/client/ui";
import { Action } from "./action.tsx";
import { messages, type MessageKey } from "./messages.ts";
import { connection, services, type ServiceValues } from "../shared/services.ts";

type Settings = SettingsState<typeof services.schema>;
type Ready = Extract<Settings, { status: "ready" }>;
type Draft = { originalName: string | null; values: ServiceValues; revision: string };

function ServiceEditor({ draft, settings, theme, onClose }: { draft: Draft; settings: Settings; theme: PluginScreenProps["theme"]; onClose(): void }) {
  const { t } = useTranslation(messages);
  const initial = draft.originalName === null ? undefined : draft.values.services[draft.originalName];
  const [base, setBase] = useState(draft);
  const [name, setName] = useState(draft.originalName ?? "");
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [transport, setTransport] = useState<"http" | "stdio">(initial?.config.type ?? "http");
  const [url, setUrl] = useState(initial?.config.type === "http" ? initial.config.url : "");
  const [command, setCommand] = useState(initial?.config.type === "stdio" ? initial.config.command : "");
  const [args, setArgs] = useState(JSON.stringify(initial?.config.type === "stdio" ? initial.config.args ?? [] : [], null, 2));
  const [env, setEnv] = useState(JSON.stringify(initial?.config.type === "stdio" ? initial.config.env ?? {} : {}, null, 2));
  const [headers, setHeaders] = useState(JSON.stringify(initial?.config.type === "http" ? initial.config.headers ?? {} : {}, null, 2));
  const [alwaysLoad, setAlwaysLoad] = useState<"default" | "true" | "false">(initial?.config.alwaysLoad === undefined ? "default" : String(initial.config.alwaysLoad) as "true" | "false");
  const [mode, setMode] = useState<"form" | "json">("form");
  const [json, setJson] = useState("");
  const [error, setError] = useState<MessageKey | "">("");
  const [saveFailed, setSaveFailed] = useState(false);
  const blocked = settings.saving || settings.status !== "ready";
  const textStyle = { color: theme.colors.foreground };
  const jsonStyle = { minHeight: 140, padding: 12, color: theme.colors.foreground, backgroundColor: theme.colors.surface0 };

  const parse = () => {
    try {
      const value: unknown = mode === "json" ? JSON.parse(json) : { ...(transport === "http" ? { type: "http", url: url.trim(), headers: JSON.parse(headers) } : { type: "stdio", command, args: JSON.parse(args), env: JSON.parse(env) }), ...(alwaysLoad === "default" ? {} : { alwaysLoad: alwaysLoad === "true" }) };
      const result = connection.safeParse(value);
      if (result.success) return result.data;
    } catch {}
    setError("validationConnection");
  };
  const switchMode = () => {
    setError("");
    const value = parse();
    if (!value) return;
    if (mode === "form") { setJson(JSON.stringify(value, null, 2)); setMode("json"); }
    else {
      setTransport(value.type);
      if (value.type === "http") { setUrl(value.url); setHeaders(JSON.stringify(value.headers ?? {}, null, 2)); }
      else { setCommand(value.command); setArgs(JSON.stringify(value.args ?? [], null, 2)); setEnv(JSON.stringify(value.env ?? {}, null, 2)); }
      setAlwaysLoad(value.alwaysLoad === undefined ? "default" : value.alwaysLoad ? "true" : "false");
      setMode("form");
    }
  };
  const save = async () => {
    setError("");
    const key = name.trim();
    if (key !== base.originalName && Object.hasOwn(base.values.services, key)) { setError("validationDuplicate"); return; }
    const config = parse();
    if (!config) return;
    const next = { ...base.values.services };
    if (base.originalName !== null) delete next[base.originalName];
    const parsed = services.schema.safeParse({ services: { ...next, [key]: { enabled, config } } });
    if (!parsed.success) { setError("validationName"); return; }
    if (await settings.save(parsed.data, base.revision)) onClose();
    else setSaveFailed(true);
  };
  return <Modal title={draft.originalName === null ? t("addService") : t("editNamed", { name: draft.originalName })} open onOpenChange={open => { if (!open && !settings.saving) onClose(); }}><Modal.Content>
    <SettingsCard>
      <SettingsInput label={t("serviceName")} initialValue={name} onChangeText={setName} disabled={blocked} placeholder="search" />
      <SettingsSwitch label={t("enabledNew")} value={enabled} onValueChange={setEnabled} disabled={blocked} />
      <SettingsAction label={t("connectionEditor")} actionLabel={mode === "form" ? t("editJson") : t("useForm")} disabled={blocked} onPress={switchMode} />
      {mode === "json" ? <SettingsRow label={t("connectionJson")} hint={t("connectionHint")}>
        <TextInput accessibilityLabel={t("connectionJson")} multiline value={json} onChangeText={setJson} editable={!blocked} autoCapitalize="none" autoCorrect={false} style={jsonStyle} />
      </SettingsRow> : <View key="form">
        <SettingsSelect<"http" | "stdio"> label={t("transport")} value={transport} options={[{ label: "HTTP", value: "http" }, { label: "stdio", value: "stdio" }]} onValueChange={setTransport} disabled={blocked} />
        {transport === "http" ? <View key="http">
        <SettingsInput label={t("url")} initialValue={url} onChangeText={setUrl} disabled={blocked} placeholder="https://example.com/mcp" />
        <SettingsRow label={t("headers")} hint={t("headersHint")}>
          <TextInput accessibilityLabel={t("headersInput")} multiline value={headers} onChangeText={setHeaders} editable={!blocked} autoCapitalize="none" autoCorrect={false} style={jsonStyle} />
        </SettingsRow>
        </View> : <View key="stdio">
          <SettingsInput label={t("command")} initialValue={command} onChangeText={setCommand} disabled={blocked} placeholder="node" />
          <SettingsRow label={t("arguments")} hint={t("argumentsHint")}>
            <TextInput accessibilityLabel={t("argumentsInput")} multiline value={args} onChangeText={setArgs} editable={!blocked} autoCapitalize="none" autoCorrect={false} style={jsonStyle} />
          </SettingsRow>
          <SettingsRow label={t("environment")} hint={t("environmentHint")}>
            <TextInput accessibilityLabel={t("environmentInput")} multiline value={env} onChangeText={setEnv} editable={!blocked} autoCapitalize="none" autoCorrect={false} style={jsonStyle} />
          </SettingsRow>
        </View>}
        <SettingsSelect<"default" | "true" | "false"> label={t("toolLoading")} value={alwaysLoad} options={[{ label: t("providerDefault"), value: "default" }, { label: t("alwaysLoad"), value: "true" }, { label: t("onDemand"), value: "false" }]} onValueChange={setAlwaysLoad} disabled={blocked} />
      </View>}
    </SettingsCard>
    {error ? <Text accessibilityRole="alert" style={textStyle}>{t(error)}</Text> : null}
    {saveFailed ? <View style={{ gap: 8 }}>
      <Text accessibilityRole="alert" style={textStyle}>{t("saveConflict")}</Text>
      <SettingsAction label={t("keepDraftReload")} actionLabel={t("reloadSaved")} disabled={settings.saving} onPress={() => void settings.reload()} />
      {settings.status === "ready" ? <Text style={textStyle}>{t("currentServices", { names: Object.keys(settings.values.services).join(", ") || "—" })}</Text> : null}
      <SettingsAction label={t("baseHint")} actionLabel={t("useLatest")} disabled={blocked} onPress={() => {
        if (settings.status === "ready") { setBase({ ...base, values: settings.values, revision: settings.revision }); setSaveFailed(false); }
      }} />
    </View> : null}
    <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
      <Action theme={theme} label={t("cancel")} disabled={settings.saving} onPress={onClose} />
      <Action theme={theme} primary label={settings.saving ? t("saving") : t("saveService")} disabled={blocked} onPress={() => void save()} />
    </View>
  </Modal.Content></Modal>;
}

export function Manager({ theme, layout }: PluginScreenProps) {
  const { t } = useTranslation(messages);
  const settings = useSettings(services);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deletion, setDeletion] = useState<{ name: string; base: Ready } | null>(null);
  const [notice, setNotice] = useState<MessageKey | "">("");
  const text = { color: theme.colors.foreground };
  const start = (name: string | null) => {
    if (settings.status === "ready") { setDraft({ originalName: name, values: settings.values, revision: settings.revision }); setNotice(""); }
  };
  const toggle = async (name: string) => {
    if (settings.status !== "ready") return;
    const item = settings.values.services[name]!;
    const ok = await settings.save({ services: { ...settings.values.services, [name]: { ...item, enabled: !item.enabled } } }, settings.revision);
    setNotice(ok ? "saved" : "saveFailed");
  };
  const remove = async () => {
    if (!deletion) return;
    const next = { ...deletion.base.values.services };
    delete next[deletion.name];
    if (await settings.save({ services: next }, deletion.base.revision)) { setDeletion(null); setNotice("deleted"); }
    else setNotice("deleteFailed");
  };
  return <View style={{ flex: 1, backgroundColor: theme.colors.surface0 }}>
    <ScrollView contentContainerStyle={{ padding: layout.compact ? 16 : 24, gap: 24, width: "100%", maxWidth: 1000, alignSelf: "center" }}>
      <View style={{ gap: 8 }}>
        <Text accessibilityRole="header" style={{ ...text, fontSize: 24, fontWeight: "600" }}>{t("connectionsTitle")}</Text>
        <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{t("scopeHint")}</Text>
        <Text style={{ color: theme.colors.foregroundMuted, lineHeight: 22 }}>{t("providerHint")}</Text>
      </View>
      {settings.status === "loading" ? <Text style={text}>{t("loading")}</Text> : settings.status !== "ready" ? <SettingsSection title={t(settings.status === "invalid" ? "invalidTitle" : "readErrorTitle")}>
        <Text accessibilityRole="alert" style={text}>{t(settings.status === "invalid" ? "invalidHint" : "readErrorHint")}</Text>
        <SettingsAction label={t("readAgain")} actionLabel={t("reload")} onPress={() => void settings.reload()} />
      </SettingsSection> : <SettingsSection title={t("servicesCount", { count: Object.keys(settings.values.services).length })}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", gap: 8 }}>
          <Action theme={theme} label={t("reload")} disabled={settings.saving || !!draft || !!deletion} onPress={() => void settings.reload()} />
          <Action theme={theme} primary label={t("addService")} disabled={settings.saving || !!draft || !!deletion} onPress={() => start(null)} />
        </View>
        {!Object.keys(settings.values.services).length ? <Text style={text}>{t("empty")}</Text> : <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{Object.entries(settings.values.services).map(([name, value]) => <View key={name} style={{ flexBasis: layout.compact ? "100%" : 320, flexGrow: 1 }}><SettingsCard>
          <SettingsSwitch label={name} hint={`${value.config.type === "http" ? "HTTP" : "stdio"} · ${t(value.enabled ? "enabledNew" : "disabled")}`} value={value.enabled} disabled={settings.saving || !!draft || !!deletion} onValueChange={() => void toggle(name)} />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", gap: 4, paddingHorizontal: 12, paddingBottom: 8 }}>
            <Action theme={theme} label={t("edit")} accessibilityLabel={t("editNamed", { name })} disabled={settings.saving || !!draft || !!deletion} onPress={() => start(name)} />
            <Action theme={theme} danger label={t("delete")} accessibilityLabel={t("removeNamed", { name })} disabled={settings.saving || !!draft || !!deletion} onPress={() => { setDeletion({ name, base: settings }); setNotice(""); }} />
          </View>
        </SettingsCard></View>)}</View>}
      </SettingsSection>}
      {notice && !deletion ? <Text accessibilityRole="alert" style={text}>{t(notice)}</Text> : null}
    </ScrollView>
    {draft ? <ServiceEditor draft={draft} settings={settings} theme={theme} onClose={() => setDraft(null)} /> : null}
    {deletion ? <Modal title={t("deleteTitle", { name: deletion.name })} open onOpenChange={open => { if (!open && !settings.saving) setDeletion(null); }}><Modal.Content>
      <Text style={text}>{t("deleteHint")}</Text>
      {notice ? <Text accessibilityRole="alert" style={text}>{t(notice)}</Text> : null}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <Action theme={theme} label={t("cancel")} disabled={settings.saving} onPress={() => setDeletion(null)} />
        <Action theme={theme} danger label={t("confirmDelete")} disabled={settings.saving || settings.status !== "ready"} onPress={() => void remove()} />
      </View>
    </Modal.Content></Modal> : null}
  </View>;
}
