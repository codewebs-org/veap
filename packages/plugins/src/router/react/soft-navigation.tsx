"use client";

import * as React from "react";

export interface SoftNavigationInterceptorProps {
  children: React.ReactNode;
  onNavigate?: (href: string) => void;
}

/**
 * Intercepts internal link clicks for soft client-side navigation.
 * Returns true if the navigation was intercepted and preventDefault was called.
 */
export function handleSoftNavigationClick(
  e: MouseEvent,
  onNavigate: (href: string) => void,
): boolean {
  // Ignore clicks with modifiers or non-left clicks
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
    return false;
  }

  // Find the closest anchor tag
  let target = e.target as HTMLElement | null;
  while (target && target.tagName !== "A") {
    target = target.parentElement;
  }

  if (!target) return false;

  const anchor = target as HTMLAnchorElement;
  const href = anchor.getAttribute("href");

  // Only intercept internal links
  if (
    href?.startsWith("/") &&
    !href.startsWith("//") &&
    anchor.target !== "_blank" &&
    !anchor.hasAttribute("download") &&
    anchor.getAttribute("rel") !== "external"
  ) {
    e.preventDefault();
    onNavigate(href);
    return true;
  }

  return false;
}

export function SoftNavigationInterceptor({
  children,
  onNavigate,
}: SoftNavigationInterceptorProps) {
  React.useEffect(() => {
    if (!onNavigate) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      handleSoftNavigationClick(e, onNavigate);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onNavigate]);

  return <>{children}</>;
}
