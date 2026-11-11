import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  agencyName: z.string().min(1),
});

export const clientSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  contactEmail: z.string().email().optional().or(z.literal("")),
  aiMentionsEnabled: z.boolean().optional(),
});

export const workLogSchema = z.object({
  clientId: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(["seo", "content", "technical", "links", "other"]).default("seo"),
  hours: z.number().optional().nullable(),
});

export const orgBrandingSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  scheduleDay: z.number().int().min(1).max(28),
});

export const connectionSchema = z.object({
  clientId: z.string().min(1),
  type: z.enum(["ga4", "gsc"]),
  provider: z.enum(["mock", "google"]).default("mock"),
  externalId: z.string().optional(),
  displayName: z.string().optional(),
});

export const reportCreateSchema = z.object({
  clientId: z.string().min(1),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
  isSample: z.boolean().optional(),
});

export const reportUpdateSchema = z.object({
  narrative: z.string().optional(),
  nextActions: z.array(z.string()).length(3).optional(),
  status: z.enum(["draft", "generating", "ready", "sent"]).optional(),
});

export const aiMentionSchema = z.object({
  clientId: z.string().min(1),
  engine: z.enum(["chatgpt", "perplexity", "gemini", "claude"]),
  prompt: z.string().min(1),
  mentioned: z.boolean(),
  citations: z.array(z.string()).default([]),
});
