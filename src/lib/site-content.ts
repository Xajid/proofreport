export const SITE_URL = "https://getsearchproof.com";

export const PER_CLIENT_MONTHLY_USD = 49;
export const AGENCY_MONTHLY_USD = 249;

export const FAQS = [
  {
    q: "Do my clients see SearchProof branding?",
    a: "Paid PDFs use your agency name, logo, and color. Trial reports and their share links keep a SearchProof watermark. Share links live on getsearchproof.com.",
  },
  {
    q: "Do clients need to create an account?",
    a: "No. They get the PDF by email and a view link. They do not sign in.",
  },
  {
    q: "How does GA4 and Search Console connect?",
    a: "You sign in with Google, then pick the property from the list we get back. If that pull fails, generation stops and names the source. Demo numbers are never saved as live data.",
  },
  {
    q: "Can I edit the narrative before sending?",
    a: "Yes. Generation leaves the report as a draft: shipped work, what moved, a correlation note, and three next actions. You edit those, mark it ready, then send.",
  },
] as const;

export type PublicPage = {
  path: string;
  /** Title segment. The layout template appends " · SearchProof". */
  title: string;
  /** Document title that ignores the template. Homepage only. */
  absoluteTitle?: string;
  description: string;
  /** Visible h1 when it should differ from the title tag. */
  heading?: string;
  crumb: string;
  blurb: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

export const PUBLIC_PAGES = {
  home: {
    path: "/",
    title: "SearchProof — White-label monthly SEO reports for agencies",
    absoluteTitle: "SearchProof — White-label monthly SEO reports for agencies",
    description:
      "Monthly SEO reports for agencies. Log the work, pull GA4 and Search Console, edit the write-up, then email a PDF with your logo.",
    crumb: "Home",
    blurb: "Work log, GA4, Search Console, and a PDF with your name on it.",
    priority: 1,
    changeFrequency: "weekly",
  },
  pricing: {
    path: "/pricing",
    title: "White-label SEO report pricing",
    description: `$${PER_CLIENT_MONTHLY_USD} a month per client, or $${AGENCY_MONTHLY_USD} a month for every client. The trial is one client for 14 days.`,
    crumb: "Pricing",
    blurb: `$${PER_CLIENT_MONTHLY_USD} a month per client, or $${AGENCY_MONTHLY_USD} if you want the whole list.`,
    priority: 0.9,
    changeFrequency: "weekly",
  },
  sample: {
    path: "/sample",
    title: "Monthly SEO report sample",
    description:
      "A watermarked monthly SEO report for a demo client: write-up, GA4, Search Console, work log, and three next actions.",
    crumb: "Sample report",
    heading: "A month for Bright Plumbing",
    blurb: "Bright Plumbing, written out. Watermarked PDF at the top.",
    priority: 0.9,
    changeFrequency: "weekly",
  },
  whiteLabel: {
    path: "/white-label-seo-reports",
    title: "White-label SEO reports for freelancers",
    description:
      "Freelance SEO reports with your name, logo, and color on the PDF. Trial files stay watermarked.",
    crumb: "White-label reports",
    heading: "Your name on the PDF",
    blurb: "Your logo on the paid PDF. The trial file still has our watermark.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  agency: {
    path: "/agency-seo-reporting",
    title: "Monthly SEO reporting for agencies",
    description:
      "The same monthly PDF for every client. A job drafts last month. Someone on your team still edits it before it sends.",
    crumb: "Agency reporting",
    heading: "Same file for every client",
    blurb: "One layout for the list. The monthly job drafts them. You still send them.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  comparison: {
    path: "/searchproof-vs-looker-studio",
    title: "SearchProof vs Looker Studio",
    description:
      "Looker Studio stays open all month. SearchProof is the PDF you email: work log, numbers, and a write-up you edit first.",
    crumb: "Vs Looker Studio",
    heading: "The board and the monthly file",
    blurb: "Looker for the live board. This for the file you send at month end.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  guide: {
    path: "/monthly-seo-report",
    title: "What to put in a monthly SEO report",
    description:
      "What goes in a monthly SEO report: the work log, GA4 and Search Console, a line on correlation, and three next actions.",
    crumb: "Report guide",
    heading: "What goes in the file",
    blurb: "Which pages we include, and the line about correlation.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  mentions: {
    path: "/ai-search-mentions",
    title: "How to report AI search mentions",
    description:
      "An optional last page on the PDF: the prompt, the model, whether the brand was named, and the URLs in the answer.",
    crumb: "AI search mentions",
    heading: "The last page, if you turn it on",
    blurb: "Optional last page. Prompt, model, and whether the name showed up.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy policy",
    description:
      "How SearchProof collects, uses, and stores account data and Google Analytics and Search Console data.",
    crumb: "Privacy",
    blurb: "How account data and Google properties are stored.",
    priority: 0.2,
    changeFrequency: "yearly",
  },
  terms: {
    path: "/terms",
    title: "Terms of service",
    description: "The terms for using SearchProof to draft and send monthly SEO client reports.",
    crumb: "Terms",
    blurb: "The terms for drafting and sending client reports.",
    priority: 0.2,
    changeFrequency: "yearly",
  },
} as const satisfies Record<string, PublicPage>;

export const GUIDE_LINKS = [
  PUBLIC_PAGES.sample,
  PUBLIC_PAGES.whiteLabel,
  PUBLIC_PAGES.agency,
  PUBLIC_PAGES.comparison,
  PUBLIC_PAGES.guide,
  PUBLIC_PAGES.mentions,
] as const;

export const ARTICLE_PUBLISHED = "2026-11-21";
