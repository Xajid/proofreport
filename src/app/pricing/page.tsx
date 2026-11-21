import { PricingCheckout } from "./pricing-checkout";
import { JsonLd } from "@/components/json-ld";
import { faqJsonLd, pageMeta } from "@/lib/seo";
import { PUBLIC_PAGES } from "@/lib/site-content";

export const metadata = pageMeta(PUBLIC_PAGES.pricing);

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <PricingCheckout />
    </>
  );
}
