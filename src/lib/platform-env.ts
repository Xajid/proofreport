/** Runtime lookup. A static process.env.NAME is frozen at build time, so a key added in Vercel stays invisible until the next build. */
function envValue(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function envConfigured(name: string) {
  return envValue(name).length > 0;
}

export type PlatformIntegration = {
  id: string;
  label: string;
  envName: string;
  detail: string;
  configured: boolean;
};

export function platformIntegrations(): PlatformIntegration[] {
  const nvidia = envConfigured("NVIDIA_API_KEY");
  const openai = envConfigured("OPENAI_API_KEY");
  const provider = envValue("AI_PROVIDER") || (nvidia ? "nvidia" : openai ? "openai" : "template");
  const nvidiaModel = envValue("NVIDIA_MODEL") || "nvidia/nemotron-3.5-bolt-e4b";
  const openaiModel = envValue("OPENAI_MODEL") || "gpt-4o-mini";

  return [
    {
      id: "nvidia",
      label: "NVIDIA Nemotron",
      envName: "NVIDIA_API_KEY",
      detail: nvidia ? `Active model ${nvidiaModel}. Provider preference: ${provider}.` : "Key missing. Narratives fall back.",
      configured: nvidia,
    },
    {
      id: "openai",
      label: "OpenAI",
      envName: "OPENAI_API_KEY",
      detail: openai ? `Model ${openaiModel}. Used when NVIDIA is unset or AI_PROVIDER=openai.` : "Key missing.",
      configured: openai,
    },
    {
      id: "google",
      label: "Google GA4 / GSC",
      envName: "GOOGLE_CLIENT_ID",
      detail: "OAuth for traffic and search metrics.",
      configured: envConfigured("GOOGLE_CLIENT_ID") && envConfigured("GOOGLE_CLIENT_SECRET"),
    },
    {
      id: "dodo",
      label: "Dodo Payments",
      envName: "DODO_PAYMENTS_API_KEY",
      detail: "Checkout and subscription billing.",
      configured: envConfigured("DODO_PAYMENTS_API_KEY"),
    },
    {
      id: "resend",
      label: "Resend",
      envName: "RESEND_API_KEY",
      detail: "Report email and password reset.",
      configured: envConfigured("RESEND_API_KEY"),
    },
  ];
}
