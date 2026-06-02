import { z } from "@hono/zod-openapi";

// ==================== PersonalInfo ====================
export const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
  bio: z.string(),
});
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// ==================== Appearance ====================
export const AppearanceSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
});
export type Appearance = z.infer<typeof AppearanceSchema>;

// ==================== Schema Mapping ====================
export const configSchemaMapping = {
  personalInfo: PersonalInfoSchema,
  appearance: AppearanceSchema,
} as const;

export type ConfigKey = keyof typeof configSchemaMapping;

// ==================== Full Config ====================
export const FullConfigSchema = z.object(configSchemaMapping);
export type FullConfig = z.infer<typeof FullConfigSchema>;
