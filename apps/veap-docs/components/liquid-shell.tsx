"use client";

import { useTheme } from "next-themes";
import {
  type CSSProperties,
  type ReactNode,
  useSyncExternalStore,
} from "react";

import { Liquid, type LiquidOptions } from "@/components/canvasui/liquid";
import { cn } from "@/lib/utils";

/**
 * Official Veap brand cyan (#0ac5b2) as sRGB in 0–1 range (Liquid converts to linear).
 */
const BRAND_CYAN: [number, number, number] = [0.039, 0.773, 0.698];

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export interface LiquidShellProps extends LiquidOptions {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  contentClassName?: string;
  opacity?: number;
}

/**
 * Canvas UI Liquid background or container wrapper.
 *
 * When used without children (`<LiquidShell />`), it renders as a fixed viewport
 * background layer sitting beneath all page content.
 * When used with children (`<LiquidShell>{children}</LiquidShell>`), it wraps
 * and bounds the effect strictly inside that container.
 */
export function LiquidShell({
  children,
  className,
  style,
  contentClassName,
  force = 0.2,
  radius = 0.08,
  curl = 0.8,
  pressureIterations = 2,
  pressure = 0.4,
  intensity,
  distortion = 0.15,
  blend,
  densityDissipation = 0.84,
  velocityDissipation = 0.96,
  color,
  rainbow = false,
  globalPointer = true,
  opacity,
  ...rest
}: LiquidShellProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = !mounted || resolvedTheme !== "light";

  const resolvedColor = color ?? BRAND_CYAN;
  const resolvedIntensity = intensity ?? (isDark ? 0.4 : 0.5);
  const resolvedBlend = blend ?? 2;
  const resolvedOpacity = opacity ?? (isDark ? 0.15 : 0.25);

  return (
    <Liquid
      force={force}
      radius={radius}
      curl={curl}
      pressureIterations={pressureIterations}
      pressure={pressure}
      intensity={resolvedIntensity}
      distortion={distortion}
      blend={resolvedBlend}
      densityDissipation={densityDissipation}
      velocityDissipation={velocityDissipation}
      color={resolvedColor}
      rainbow={rainbow}
      globalPointer={globalPointer}
      className={cn(
        children
          ? "relative overflow-hidden"
          : "pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden",
        className,
      )}
      style={{
        ...(children ? {} : { position: "fixed" }),
        opacity: resolvedOpacity,
        ...style,
      }}
      {...rest}
    >
      {children ? (
        <div className={cn("relative h-full w-full", contentClassName)}>
          {children}
        </div>
      ) : null}
    </Liquid>
  );
}
