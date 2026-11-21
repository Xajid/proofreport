import { HelpCircle } from "lucide-react";
import { FAQS } from "@/lib/site-content";

export function FaqList({ level = 2 }: { level?: 2 | 3 }) {
  const Title = level === 2 ? "h2" : "h3";
  const Question = level === 2 ? "h3" : "h4";

  return (
    <div className="mt-20 border-t border-slate-200/80 pt-16">
      <div className="mb-10 text-center">
        <Title id="faq-heading" className="font-display text-2xl font-semibold text-slate-900">
          Frequently asked questions
        </Title>
        <p className="mt-1 text-xs text-slate-500">Billing, the Google connection, and what the client gets.</p>
      </div>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {FAQS.map((faq) => (
          <div key={faq.q} className="rounded-[14px] border border-slate-200/70 bg-white p-6 shadow-xs">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
              <div>
                <Question className="text-sm font-semibold text-slate-900">{faq.q}</Question>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
