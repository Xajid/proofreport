# ProofReport — Agency Client Reporting MVP

White-label monthly SEO client reports for freelancers and small agencies.

**Core wedge:** Work log + GA4/GSC metrics → AI (or template) executive narrative → editable next actions → branded PDF.

## Quick start

```bash
pnpm install
pnpm db:setup   # prisma db push + seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

- Email: `demo@proofreport.app`
- Password: `demo12345`
- Agency: Northline SEO
- Client: Bright Plumbing Co.

## Demo walkthrough

1. Log in with the demo account.
2. Open **Clients → Bright Plumbing Co.**
3. Review connected GA4 + GSC (mock provider).
4. Add or edit **Work log** entries.
5. Click **Generate now** — pulls metrics, writes narrative + 3 next actions.
6. Edit narrative/actions, **Mark ready**, **Download PDF**.
7. Toggle **AI mentions** and run mock AEO check (optional last PDF page).
8. Visit `/sample` or `/api/sample` for a watermarked public sample.
9. Visit `/pricing` for GTM pricing ($49–$99/client, $199–$499 agency).

## Environment variables

Copy `.env.example` → `.env`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite `file:./dev.db` or Postgres URL |
| `NEXTAUTH_URL` | Yes | e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Session secret |
| `OPENAI_API_KEY` | No | AI narrative; else deterministic template |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Real GA4/GSC adapter hook; else mock metrics |
| `STRIPE_SECRET_KEY` + price IDs | No | Live Stripe Checkout; else mock redirect |

## Architecture

- **Next.js App Router** + TypeScript + Tailwind
- **Prisma** + SQLite (switch to Postgres via `DATABASE_URL`)
- Providers: `MetricsProvider`, `NarrativeProvider`, `PdfRenderer`
- Auth: NextAuth credentials (email/password)
- Google OAuth is for **data connectors**, separate from login

## Scripts

- `pnpm dev` — development server
- `pnpm db:setup` — migrate schema + seed
- `pnpm db:seed` — re-seed demo data
- `pnpm build` / `pnpm start` — production

## Project docs

- Outreach copy: `../../docs/gtm-outreach.md`
- Build status: `../../docs/build-status.md`
