import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const serviceName = z.string().regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores")
  .refine((name) => !["paseo", "__proto__", "constructor", "prototype"].includes(name), "This name is reserved");

export const connection = z.object({
  type: z.literal("http"),
  url: z.url({ protocol: /^https?$/ }),
  headers: z.record(z.string(), z.string()).optional(),
  alwaysLoad: z.boolean().optional(),
}).strict();

export const services = defineSettings({
  id: "connections",
  scope: "host",
  version: 1,
  schema: z.object({
    services: z.record(serviceName, z.object({ enabled: z.boolean().default(true), config: connection }).strict()).default({}),
  }).strict(),
});

export type ServiceValues = z.output<typeof services.schema>;
