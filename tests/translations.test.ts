import assert from "node:assert/strict";
import { test } from "node:test";
import { defineTranslations, PluginTranslationRuntime } from "../node_modules/@getpaseo/plugin/dist/client/translations.js";
import { en, zhCN } from "../client/locales.ts";

test("English and Chinese cover the same UI messages and interpolation fields", () => {
  assert.deepEqual(Object.keys(zhCN).sort(), Object.keys(en).sort());
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    assert.ok(en[key].trim() && zhCN[key].trim());
    const fields = (text: string) => [...text.matchAll(/{{(.*?)}}/g)].map(match => match[1]).sort();
    assert.deepEqual(fields(zhCN[key]), fields(en[key]), key);
  }
});

test("app language changes translate titles and preserve literal service names, with English fallback", () => {
  let locale = "en";
  let changed = () => {};
  const runtime = new PluginTranslationRuntime({ getLocale: () => locale, subscribe: listener => { changed = listener; return () => {}; } });
  const messages = defineTranslations({ resources: { en, "zh-CN": zhCN } });
  try {
    const title = messages.message("managerTitle");
    assert.equal(runtime.resolve(title), "MCP Manager");
    locale = "zh-CN"; changed();
    assert.equal(runtime.resolve(title), "MCP 管理");
    assert.equal(runtime.t(messages, "editNamed", { name: "my-search_1" }), "编辑 my-search_1");
    assert.equal(runtime.t(messages, "servicesCount", { count: 15 }), "服务（15）");
    locale = "fr"; changed();
    assert.equal(runtime.resolve(title), "MCP Manager");
    assert.equal(runtime.t(messages, "saveService"), "Save service");
  } finally { runtime.dispose(); }
});
