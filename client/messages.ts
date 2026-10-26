import { defineTranslations } from "@getpaseo/plugin/client";
import { en, zhCN } from "./locales.ts";

export const messages = defineTranslations({ resources: { en, "zh-CN": zhCN } });
export type MessageKey = {
  [Key in keyof typeof en]: typeof en[Key] extends `${string}{{${string}` ? never : Key
}[keyof typeof en];
