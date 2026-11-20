import Link from "next/link";

export function BrandIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  tone?: "dark" | "light" | "auto";
  href?: string;
  className?: string;
  showBadge?: boolean;
}

export function BrandLogo({
  size = "md",
  tone = "auto",
  href,
  className = "",
  showBadge = false,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 26,
    md: 32,
    lg: 40,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const isLight = tone === "light";

  const primaryTextColor = isLight
    ? "text-white"
    : "text-slate-900";

  const secondaryTextColor = isLight
    ? "text-teal-300"
    : "text-teal-600";

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandIcon size={iconSizes[size]} className="shrink-0 transition-transform duration-200 group-hover:scale-105" />
      <div className="flex items-center gap-1.5">
        <span className={`font-display font-bold tracking-tight leading-none ${textSizes[size]} ${primaryTextColor}`}>
          Search<span className={`font-semibold ${secondaryTextColor}`}>Proof</span>
        </span>
        {showBadge && (
          <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-600 border border-teal-500/20">
            PRO
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
