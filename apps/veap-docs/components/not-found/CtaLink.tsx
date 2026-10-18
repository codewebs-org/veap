"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SPRING = { type: "spring", stiffness: 300, damping: 22 } as const;

export default function CtaLink({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={SPRING}
    >
      <Link
        href={href}
        className={cn(
          "flex h-12 items-center rounded-3xl px-6 font-runde text-sm font-semibold text-white transition-colors duration-150 ease-out",
          primary
            ? "bg-[#0ac5b2] hover:bg-[#00897B]"
            : "bg-neutral-900 hover:bg-neutral-800",
        )}
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {label}
      </Link>
    </motion.div>
  );
}
