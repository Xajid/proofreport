#!/usr/bin/env node
import DodoPayments from "dodopayments";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env");
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf-8");
}

function getEnvVal(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

function setEnvVal(key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}="${value}"`);
  } else {
    envContent += `\n${key}="${value}"`;
  }
}

async function main() {
  const apiKey = process.argv[2] || process.env.DODO_PAYMENTS_API_KEY || getEnvVal("DODO_PAYMENTS_API_KEY");
  const envMode = process.argv[3] || process.env.DODO_PAYMENTS_ENV || getEnvVal("DODO_PAYMENTS_ENV") || "test_mode";

  if (!apiKey) {
    console.error("Error: Missing Dodo Payments API Key.");
    console.log("Usage: node scripts/setup-dodo.mjs <API_KEY> [test_mode|live_mode]");
    console.log("Or add DODO_PAYMENTS_API_KEY to your .env file.");
    process.exit(1);
  }

  console.log(`Connecting to Dodo Payments (${envMode})...`);
  const client = new DodoPayments({
    bearerToken: apiKey,
    environment: envMode === "live_mode" ? "live_mode" : "test_mode",
  });

  console.log("Creating or finding subscription products...");

  let perClientId = getEnvVal("DODO_PRODUCT_PER_CLIENT");
  let agencyId = getEnvVal("DODO_PRODUCT_AGENCY");

  try {
    if (!perClientId) {
      console.log("Creating 'SearchProof — Per Client Plan' ($49/mo)...");
      const p1 = await client.products.create({
        name: "SearchProof — Per Client Plan",
        description: "Monthly subscription for 1 active client reporting workspace",
        tax_category: "digital_products",
        price: {
          type: "recurring_price",
          currency: "USD",
          price: 4900,
          payment_frequency_count: 1,
          payment_frequency_interval: "Month",
          subscription_period_count: 12,
          subscription_period_interval: "Month",
        },
      });
      perClientId = p1.product_id;
      console.log(`✓ Created Per Client product: ${perClientId}`);
    } else {
      console.log(`• Reusing existing Per Client product: ${perClientId}`);
    }

    if (!agencyId) {
      console.log("Creating 'SearchProof — Unlimited Agency Plan' ($249/mo)...");
      const p2 = await client.products.create({
        name: "SearchProof — Unlimited Agency Plan",
        description: "Monthly subscription for unlimited agency client reporting & team seats",
        tax_category: "digital_products",
        price: {
          type: "recurring_price",
          currency: "USD",
          price: 24900,
          payment_frequency_count: 1,
          payment_frequency_interval: "Month",
          subscription_period_count: 12,
          subscription_period_interval: "Month",
        },
      });
      agencyId = p2.product_id;
      console.log(`✓ Created Agency product: ${agencyId}`);
    } else {
      console.log(`• Reusing existing Agency product: ${agencyId}`);
    }

    setEnvVal("DODO_PAYMENTS_API_KEY", apiKey);
    setEnvVal("DODO_PAYMENTS_ENV", envMode);
    setEnvVal("DODO_PRODUCT_PER_CLIENT", perClientId);
    setEnvVal("DODO_PRODUCT_AGENCY", agencyId);

    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");
    console.log("✓ Updated .env with Dodo Payments configuration successfully!");
    console.log("\nNext Steps:");
    console.log("1. In Dodo Payments Dashboard -> Webhooks:");
    console.log("   Add endpoint: https://getsearchproof.com/api/dodo/webhook");
    console.log("   Subscribe to: payment.succeeded, subscription.active, subscription.cancelled");
    console.log("   Copy the Webhook Secret Key and add to .env as DODO_PAYMENTS_WEBHOOK_KEY");
  } catch (err) {
    console.error("Dodo Payments API Error:", err.message || err);
    process.exit(1);
  }
}

main();
