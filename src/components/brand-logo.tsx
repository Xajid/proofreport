import React from "react";
import Link from "next/link";

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * BrandIcon: The standalone SearchProof mark.
 * Stylized geometric mark combining an upward proof/verification checkmark with layered search data sheets.
 */
export function BrandIcon({ size = 32, className = "", ...props }: BrandIconProps) {
  const numSize = typeof size === "number" ? size : 32;

  return (
    <svg
      width={numSize}
      height={numSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Main teal-to-emerald gradient */}
        <linearGradient id="pr-brand-primary" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="50%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>

        {/* Electric cyan-to-emerald highlight on the proof checkmark */}
        <linearGradient id="pr-check-highlight" x1="12" y1="14" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Ambient glow filter */}
        <filter id="pr-shadow" x="0" y="2" width="40" height="38" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0d9488" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Rounded container squircle */}
      <rect
        x="3"
        y="3"
        width="34"
        height="34"
        rx="10"
        fill="url(#pr-brand-primary)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />

      {/* Background layer: stacked report sheet fold */}
      <path
        d="M22 10.5H15.5C14.12 10.5 13 11.62 13 13V27C13 28.38 14.12 29.5 15.5 29.5H24.5C25.88 29.5 27 28.38 27 27V15.5L22 10.5Z"
        fill="white"
        fillOpacity="0.08"
      />

      {/* Stem of the 'P' (vertical anchor bar) */}
      <rect
        x="13"
        y="12"
        width="3.5"
        height="16"
        rx="1.75"
        fill="white"
      />

      {/* Dynamic 'P' loop that morphs into a proof checkmark with electric highlight */}
      <path
        d="M14.5 12H21.5C24.54 12 27 14.24 27 17C27 19.76 24.54 22 21.5 22H14.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Embedded proof verification checkmark accent */}
      <path
        d="M17.5 17L20 19.5L25 14"
        stroke="url(#pr-check-highlight)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pr-shadow)"
      />
    </svg>
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
