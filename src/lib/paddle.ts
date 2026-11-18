import { Environment, Paddle } from "@paddle/paddle-node-sdk";

export function getPaddleClient(): Paddle | null {
  const apiKey = process.env.PADDLE_API_KEY?.trim();
  if (!apiKey) return null;

  const isSandbox =
    process.env.PADDLE_ENV === "sandbox" ||
    process.env.NODE_ENV !== "production" ||
    apiKey.startsWith("pdl_s_");

  return new Paddle(apiKey, {
    environment: isSandbox ? Environment.sandbox : Environment.production,
  });
}

