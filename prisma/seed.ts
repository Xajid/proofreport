import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "demo@proofreport.app" },
  });
  if (existing) {
    console.log("Seed skipped — demo user already exists");
    return;
  }

  const passwordHash = await hash("demo12345", 10);
  const periodStart = startOfMonth(subMonths(new Date(), 1));
  const periodEnd = endOfMonth(subMonths(new Date(), 1));

  const user = await prisma.user.create({
    data: {
      email: "demo@proofreport.app",
      name: "Sajid Hussain",
      passwordHash,
      orgMembers: {
        create: {
          role: "owner",
          org: {
            create: {
              name: "Northline SEO",
              primaryColor: "#0F766E",
              logoUrl: null,
              plan: "trial",
              scheduleDay: 1,
              clients: {
                create: {
                  name: "Bright Plumbing Co.",
                  domain: "brightplumb.example",
                  contactEmail: "owner@brightplumb.example",
                  aiMentionsEnabled: true,
                  connections: {
                    create: [
                      {
                        type: "ga4",
                        provider: "mock",
                        externalId: "properties/123456789",
                        displayName: "GA4 · Bright Plumbing",
                        accessToken: "mock-token",
                      },
                      {
                        type: "gsc",
                        provider: "mock",
                        externalId: "sc-domain:brightplumb.example",
                        displayName: "GSC · brightplumb.example",
                        accessToken: "mock-token",
                      },
                    ],
                  },
                  workLogs: {
                    create: [
                      {
                        periodStart,
                        periodEnd,
                        title: "Refreshed service landing pages",
                        body: "Rewrote H1s, added FAQs, and strengthened internal links on Drain Cleaning, Water Heaters, and Emergency pages.",
                        category: "content",
                        hours: 6,
                      },
                      {
                        periodStart,
                        periodEnd,
                        title: "Fixed crawl / soft-404 issues",
                        body: "Resolved 12 soft-404 URLs, updated redirects, and resubmitted sitemap in Search Console.",
                        category: "technical",
                        hours: 3.5,
                      },
                      {
                        periodStart,
                        periodEnd,
                        title: "Local citation cleanup",
                        body: "Aligned NAP on top 8 directories and responded to new Google reviews.",
                        category: "seo",
                        hours: 2,
                      },
                    ],
                  },
                  aiMentions: {
                    create: [
                      {
                        engine: "chatgpt",
                        prompt: "Who are the best plumbers near downtown?",
                        mentioned: true,
                        citationsJson: JSON.stringify([
                          "https://brightplumb.example",
                          "https://maps.example/bright",
                        ]),
                      },
                      {
                        engine: "perplexity",
                        prompt: "Recommend emergency plumbing services",
                        mentioned: true,
                        citationsJson: JSON.stringify(["https://brightplumb.example/emergency"]),
                      },
                      {
                        engine: "gemini",
                        prompt: "Top rated local plumbing companies",
                        mentioned: false,
                        citationsJson: "[]",
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    include: {
      orgMembers: {
        include: {
          org: { include: { clients: true } },
        },
      },
    },
  });

  const clientId = user.orgMembers[0].org.clients[0].id;

  await prisma.reportRun.create({
    data: {
      clientId,
      periodStart,
      periodEnd,
      status: "draft",
      isSample: false,
      watermark: false,
    },
  });

  console.log("Seed complete");
  console.log("  Login: demo@proofreport.app / demo12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
