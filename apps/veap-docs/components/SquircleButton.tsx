"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import React, { createContext, useContext, useState } from "react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

const spring = { type: "spring", stiffness: 300, damping: 22 } as const;

export const DEFAULT_GROW_PX = 18;
export const DEFAULT_SIDE_SHIFT = DEFAULT_GROW_PX / 2;

export function StretchSquircleBg({
  hovered,
  className,
  bgClassName,
  growPx = DEFAULT_GROW_PX,
  roundedClass = "rounded-3xl",
}: {
  hovered: boolean;
  className?: string;
  bgClassName: string;
  growPx?: number;
  roundedClass?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [ref, bounds] = useMeasure();
  const scaleX =
    hovered && !reduceMotion && bounds.width > 0
      ? (bounds.width + growPx) / bounds.width
      : 1;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ scaleX }}
      transition={spring}
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div
        className={cn("size-full", roundedClass, bgClassName)}
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      />
    </motion.div>
  );
}

interface GroupContextType {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

const SquircleGroupContext = createContext<GroupContextType | null>(null);

export function SquircleButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <SquircleGroupContext.Provider value={{ hoveredIndex, setHoveredIndex }}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap",
          className,
        )}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(
            child as React.ReactElement<{ _groupIndex?: number }>,
            {
              _groupIndex: index,
            },
          );
        })}
      </div>
    </SquircleGroupContext.Provider>
  );
}

export interface SquircleButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "dark" | "secondary" | "subtle";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  disabled?: boolean;
  growPx?: number;
  /** Internal group coordination */
  _groupIndex?: number;
}

const VARIANTS = {
  primary: {
    bg: "bg-[#0ac5b2] transition-colors duration-150 ease-out group-hover:bg-[#00897B]",
    text: "text-white font-semibold",
  },
  dark: {
    bg: "bg-neutral-900 transition-colors duration-150 ease-out group-hover:bg-neutral-800 dark:bg-white dark:group-hover:bg-[#0ac5b2]",
    text: "text-white dark:text-black dark:group-hover:text-black font-semibold",
  },
  secondary: {
    bg: "border border-black/[0.08] bg-white/75 shadow-2xs backdrop-blur-sm transition-all duration-150 group-hover:border-[#0ac5b2]/40 group-hover:bg-white dark:border-white/[0.1] dark:bg-white/[0.05] dark:group-hover:border-[#0ac5b2]/40 dark:group-hover:bg-white/[0.08]",
    text: "text-foreground font-medium group-hover:text-[#0ac5b2] transition-colors",
  },
  subtle: {
    bg: "bg-black/[0.06] transition-colors duration-150 ease-out group-hover:bg-black/[0.1] dark:bg-white/10 dark:group-hover:bg-white/[0.16]",
    text: "text-foreground font-semibold",
  },
} as const;

const SIZES = {
  sm: {
    height: "h-10",
    px: "px-4",
    text: "text-xs",
    rounded: "rounded-2xl",
    growPx: 14,
  },
  md: {
    height: "h-12",
    px: "px-6",
    text: "text-sm",
    rounded: "rounded-3xl",
    growPx: DEFAULT_GROW_PX,
  },
  lg: {
    height: "h-14",
    px: "px-8",
    text: "text-base",
    rounded: "rounded-3xl",
    growPx: 22,
  },
} as const;

export default function SquircleButton({
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  rel,
  disabled,
  growPx,
  _groupIndex,
}: SquircleButtonProps) {
  const reduceMotion = useReducedMotion();
  const group = useContext(SquircleGroupContext);
  const [localHovered, setLocalHovered] = useState(false);

  const isHovered =
    group != null && _groupIndex != null
      ? group.hoveredIndex === _groupIndex
      : localHovered;

  const currentSize = SIZES[size];
  const currentVariant = VARIANTS[variant];
  const activeGrowPx = growPx ?? currentSize.growPx;

  // Calculate shift in a group pair
  let shiftX = 0;
  if (
    !reduceMotion &&
    group != null &&
    _groupIndex != null &&
    group.hoveredIndex != null
  ) {
    if (_groupIndex === 0 && group.hoveredIndex === 1) {
      shiftX = -DEFAULT_SIDE_SHIFT;
    } else if (_groupIndex === 1 && group.hoveredIndex === 0) {
      shiftX = DEFAULT_SIDE_SHIFT;
    }
  }

  const handleHoverStart = () => {
    if (group != null && _groupIndex != null) {
      group.setHoveredIndex(_groupIndex);
    } else {
      setLocalHovered(true);
    }
  };

  const handleHoverEnd = () => {
    if (group != null && _groupIndex != null) {
      group.setHoveredIndex(null);
    } else {
      setLocalHovered(false);
    }
  };

  const innerContent = (
    <div
      className={cn(
        "relative z-10 flex h-full items-center justify-center gap-2 font-runde",
        currentSize.px,
        currentSize.text,
        currentVariant.text,
      )}
    >
      {children}
    </div>
  );

  const wrapperClasses = cn(
    "group relative inline-flex shrink-0 items-center justify-center select-none cursor-pointer",
    currentSize.height,
    disabled && "opacity-50 pointer-events-none",
    className,
  );

  // If external link
  if (href) {
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      target === "_blank";

    const linkProps = {
      className: "size-full flex items-center justify-center",
      target,
      rel: isExternal && !rel ? "noreferrer" : rel,
    };

    return (
      <motion.div
        initial={false}
        animate={{ x: shiftX }}
        transition={spring}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        className={wrapperClasses}
      >
        <StretchSquircleBg
          hovered={isHovered}
          bgClassName={currentVariant.bg}
          growPx={activeGrowPx}
          roundedClass={currentSize.rounded}
        />
        {isExternal ? (
          <a href={href} {...linkProps}>
            {innerContent}
          </a>
        ) : (
          <Link href={href} {...linkProps}>
            {innerContent}
          </Link>
        )}
      </motion.div>
    );
  }

  // Button element
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      initial={false}
      animate={{ x: shiftX }}
      transition={spring}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      className={wrapperClasses}
    >
      <StretchSquircleBg
        hovered={isHovered}
        bgClassName={currentVariant.bg}
        growPx={activeGrowPx}
        roundedClass={currentSize.rounded}
      />
      {innerContent}
    </motion.button>
  );
}
