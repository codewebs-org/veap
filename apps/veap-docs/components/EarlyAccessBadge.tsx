import Link from "next/link";

interface EarlyAccessBadgeProps {
  label?: string;
  href?: string;
  className?: string;
}

export default function EarlyAccessBadge({
  label = "Pre-1.0 · 14 packages",
  href = "/docs",
  className,
}: EarlyAccessBadgeProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 py-1.5 pl-3 pr-3.5 backdrop-blur-md transition-all duration-200 hover:border-[#0ac5b2]/50 hover:bg-[#0ac5b2]/15 shadow-xs ${className ?? ""}`}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0ac5b2] opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-[#0ac5b2]" />
      </span>
      <span className="font-runde text-xs font-semibold text-[#0ac5b2]">
        Early Access
      </span>
      <span className="h-3 w-px bg-[#0ac5b2]/25" />
      <span className="font-runde text-xs text-neutral-600 transition-colors group-hover:text-neutral-900 dark:text-neutral-300 dark:group-hover:text-white flex items-center gap-1">
        {label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="size-3 text-[#0ac5b2] transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
