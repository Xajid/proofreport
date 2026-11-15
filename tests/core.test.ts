import test from "node:test";
import assert from "node:assert/strict";
import { ZodError } from "zod";
import { clientSchema, orgBrandingSchema, registerSchema, reportUpdateSchema } from "../src/lib/validators";
import { apiErrorMessage, formatNumber, formatPct, parsePeriodDate, periodLabel } from "../src/lib/utils";
import { createMockMetrics } from "../src/providers/metrics/mock";
import { generateTemplateNarrative } from "../src/providers/narrative/template";
import { getLimits } from "../src/lib/plan";

test("validators reject invalid inputs and accept valid ones", () => {
  assert.throws(() => registerSchema.parse({ email: "bad", password: "123", name: "", agencyName: "" }), ZodError);
  assert.doesNotThrow(() =>
    clientSchema.parse({ name: "Acme", domain: "acme.com", contactEmail: "hi@acme.com" })
  );
  assert.throws(() =>
    orgBrandingSchema.parse({ name: "Agency", primaryColor: "red", scheduleDay: 31 })
  );
  assert.throws(() =>
    reportUpdateSchema.parse({ nextActions: ["only one"] })
  );
});

test("utils format numbers, percentages, errors, and period dates cleanly", () => {
  assert.equal(formatNumber(3842.4), "3,842");
  assert.equal(formatPct(14.2), "+14.2%");
  assert.equal(formatPct(-3.4), "-3.4%");

  const d = parsePeriodDate("2026-10-01");
  assert.equal(d.toISOString(), "2026-10-01T12:00:00.000Z");
  assert.ok(periodLabel("2026-10-01T12:00:00.000Z", "2026-10-31T12:00:00.000Z").includes("Oct"));

  try {
    registerSchema.parse({ email: "not-an-email", password: "short", name: "A", agencyName: "B" });
  } catch (err) {
    const msg = apiErrorMessage(err);
    assert.ok(msg.startsWith("email:"), `Unexpected formatted error: ${msg}`);
  }
});

test("template narrative and mock metrics produce valid structured output", () => {
  const start = parsePeriodDate("2026-10-01");
  const end = parsePeriodDate("2026-10-31");
  const metrics = createMockMetrics("acme.example", start, end);
  assert.equal(metrics.provider, "mock");
  assert.ok(metrics.search.topQueries.length > 0);
  assert.ok(metrics.conversions.goals.length > 0);

  const workLogs = [
    { title: "Landing page refresh", body: "Updated H1s and FAQs", category: "content", hours: 4 },
  ];

  const nar = generateTemplateNarrative({
    clientName: "Acme Co",
    agencyName: "Northline SEO",
    periodLabel: periodLabel(start, end),
    metrics,
    workLogs,
  });

  assert.equal(nar.source, "template");
  assert.equal(nar.nextActions.length, 3);
  assert.ok(nar.narrative.includes("Acme Co"));
  assert.ok(nar.narrative.includes("Landing page refresh"));
});

test("plan limits enforce strict constraints per tier and fallback securely", () => {
  const trial = getLimits("trial");
  assert.equal(trial.maxClients, 1);
  assert.equal(trial.watermark, true);
  assert.equal(trial.aiMentions, false);
  assert.equal(trial.cronScheduled, false);

  const perClient = getLimits("per_client");
  assert.equal(perClient.maxClients, Infinity);
  assert.equal(perClient.watermark, false);
  assert.equal(perClient.aiMentions, true);
  assert.equal(perClient.cronScheduled, false);

  const agency = getLimits("agency");
  assert.equal(agency.maxClients, Infinity);
  assert.equal(agency.watermark, false);
  assert.equal(agency.aiMentions, true);
  assert.equal(agency.cronScheduled, true);

  // fallback unknown or empty plans to trial
  const fallback = getLimits("unknown_plan");
  assert.equal(fallback.watermark, true);
  assert.equal(fallback.maxClients, 1);
  assert.equal(fallback.aiMentions, false);

  const emptyFallback = getLimits(undefined);
  assert.equal(emptyFallback.watermark, true);
  assert.equal(emptyFallback.maxClients, 1);
});
