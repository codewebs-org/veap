"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { cn } from "@/lib/utils";

export interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({
  chart,
  className,
}: MermaidDiagramProps) {
  const reactId = useId();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"diagram" | "code">("diagram");
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      setLoading(true);
      setError(null);

      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          look: "handDrawn",
          theme: isDark ? "dark" : "neutral",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          securityLevel: "loose",
          themeVariables: isDark
            ? {
                darkMode: true,
                background: "transparent",
                mainBkg: "#12141a",
                nodeBorder: "#0ac5b2",
                primaryColor: "#12141a",
                primaryTextColor: "#f4f4f5",
                primaryBorderColor: "#0ac5b2",
                lineColor: "#71717a",
                textColor: "#f4f4f5",
                altBackground: "#181920",
              }
            : {
                darkMode: false,
                background: "transparent",
                mainBkg: "#ffffff",
                nodeBorder: "#0ac5b2",
                primaryColor: "#ffffff",
                primaryTextColor: "#18181b",
                primaryBorderColor: "#0ac5b2",
                lineColor: "#71717a",
                textColor: "#18181b",
                altBackground: "#f4f4f5",
              },
        });

        // Unique DOM ID safe for CSS selectors
        const cleanId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "") || "chart"}-${isDark ? "dark" : "light"}-${Math.random().toString(36).substring(2, 6)}`;
        const { svg: renderedSvg } = await mermaid.render(
          cleanId,
          chart.trim(),
        );

        if (isMounted) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Mermaid rendering failed:", err);
          setError(
            err instanceof Error ? err.message : "Failed to render diagram",
          );
          setLoading(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, reactId, isDark]);

  // Keyboard shortcut (Escape to close fullscreen)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleZoomIn = () =>
    setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2));
  const handleZoomOut = () =>
    setZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.5));
  const handleResetZoom = () => setZoom(1);

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCanvas = (isModal = false) => (
    <div
      ref={containerRef}
      className={cn(
        "relative flex w-full items-center justify-center overflow-auto p-6 sm:p-10",
        "bg-[#F6F8FA] bg-[radial-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:16px_16px]",
        "dark:bg-[#08090c] dark:bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)]",
        isModal ? "min-h-[70vh] flex-1" : "min-h-[220px]",
      )}
    >
      {loading && (
        <div className="flex items-center gap-2.5 py-12 font-mono text-xs text-neutral-500 dark:text-neutral-400">
          <span className="size-2 animate-ping rounded-full bg-[#0ac5b2]" />
          Rendering diagram...
        </div>
      )}

      {error && (
        <div className="flex w-full max-w-xl flex-col gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-rose-500 dark:text-rose-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Failed to parse Mermaid diagram
          </div>
          <p className="font-mono text-neutral-600 dark:text-neutral-400">
            {error}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-3 font-mono text-[12px] text-neutral-800 dark:bg-black/50 dark:text-neutral-300">
            <code>{chart}</code>
          </pre>
        </div>
      )}

      {!loading && !error && svg && (
        <div
          className="mermaid-svg-container flex justify-center transition-transform duration-150 ease-out [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:overflow-visible [&_svg]:!bg-transparent"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "group relative my-6 flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#F6F8FA] text-neutral-900 shadow-xs dark:border-white/[0.08] dark:bg-[#08080a] dark:text-neutral-200",
          className,
        )}
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {/* Header bar */}
        <div className="flex h-10 items-center justify-between border-b border-black/[0.06] bg-black/[0.02] px-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-black/[0.15] dark:bg-white/[0.12]" />
              <span className="size-2.5 rounded-full bg-black/[0.15] dark:bg-white/[0.12]" />
              <span className="size-2.5 rounded-full bg-black/[0.15] dark:bg-white/[0.12]" />
            </div>

            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5 text-[#0ac5b2]"
              >
                <rect x="3" y="3" width="6" height="6" rx="1.5" />
                <rect x="15" y="3" width="6" height="6" rx="1.5" />
                <rect x="9" y="15" width="6" height="6" rx="1.5" />
                <path d="M6 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" />
                <path d="M12 13v2" />
              </svg>
              <span className="font-mono text-[11px] font-medium tracking-wide text-neutral-700 dark:text-neutral-300">
                Mermaid Diagram
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls (only in diagram view) */}
            {activeTab === "diagram" && !loading && !error && (
              <div className="hidden items-center rounded-lg border border-black/[0.08] bg-black/[0.03] p-0.5 sm:flex dark:border-white/[0.08] dark:bg-white/[0.03]">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="flex size-6 items-center justify-center rounded text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="px-1.5 font-mono text-[10px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="flex size-6 items-center justify-center rounded text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Export SVG */}
            {activeTab === "diagram" && !loading && !error && (
              <button
                type="button"
                onClick={downloadSvg}
                title="Download SVG vector"
                className="flex size-7 items-center justify-center rounded-lg border border-black/[0.08] bg-black/[0.03] text-neutral-500 hover:border-black/15 hover:bg-black/[0.06] hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}

            {/* Fullscreen toggle */}
            {activeTab === "diagram" && !loading && !error && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                title="Fullscreen view"
                className="flex size-7 items-center justify-center rounded-lg border border-black/[0.08] bg-black/[0.03] text-neutral-500 hover:border-black/15 hover:bg-black/[0.06] hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3.5"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            )}

            {/* View toggle tabs */}
            <div className="flex items-center rounded-lg border border-black/[0.08] bg-black/[0.03] p-0.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
              <button
                type="button"
                onClick={() => setActiveTab("diagram")}
                className={cn(
                  "rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium transition-colors",
                  activeTab === "diagram"
                    ? "bg-black/10 text-neutral-900 shadow-xs dark:bg-white/10 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200",
                )}
              >
                Diagram
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={cn(
                  "rounded-md px-2.5 py-0.5 font-mono text-[11px] font-medium transition-colors",
                  activeTab === "code"
                    ? "bg-black/10 text-neutral-900 shadow-xs dark:bg-white/10 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200",
                )}
              >
                Code
              </button>
            </div>

            <CopyButton
              value={chart}
              label="Copy diagram source"
              className="size-7 rounded-lg border border-black/[0.08] bg-black/[0.03] text-neutral-500 hover:border-black/15 hover:bg-black/[0.06] hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
            />
          </div>
        </div>

        {/* Content area */}
        {activeTab === "diagram" ? (
          renderCanvas(false)
        ) : (
          <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed bg-[#F6F8FA] dark:bg-[#08080a]">
            <pre className="text-neutral-800 dark:text-neutral-200">
              <code>{chart}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4 backdrop-blur-md dark:bg-black/80 sm:p-8">
          <div className="flex h-12 items-center justify-between border-b border-black/[0.08] bg-[#F6F8FA] px-6 rounded-t-2xl dark:border-white/10 dark:bg-[#0c0d10]">
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-mono text-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4 text-[#0ac5b2]"
              >
                <rect x="3" y="3" width="6" height="6" rx="1.5" />
                <rect x="15" y="3" width="6" height="6" rx="1.5" />
                <rect x="9" y="15" width="6" height="6" rx="1.5" />
                <path d="M6 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" />
                <path d="M12 13v2" />
              </svg>
              <span>Diagram Inspector</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom in modal */}
              <div className="flex items-center rounded-lg border border-black/[0.08] bg-black/[0.03] p-0.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="px-2 font-mono text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="flex size-7 items-center justify-center rounded text-neutral-500 hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                onClick={downloadSvg}
                title="Download SVG vector"
                className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-black/[0.03] px-3 py-1.5 text-xs text-neutral-600 hover:bg-black/5 hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export SVG</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                title="Close fullscreen (Esc)"
                className="flex size-8 items-center justify-center rounded-lg border border-black/[0.08] bg-black/[0.03] text-neutral-500 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-rose-500/20 dark:hover:text-rose-300 dark:hover:border-rose-500/30 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden rounded-b-2xl border border-t-0 border-black/[0.08] dark:border-white/10">
            {renderCanvas(true)}
          </div>
        </div>
      )}
    </>
  );
}
