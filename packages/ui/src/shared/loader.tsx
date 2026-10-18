import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../utils";

const loaderVariants = cva("spinner", {
  variants: {
    variant: {
      default: "stroke-primary",
      dark: "stroke-white",
      destructive: "stroke-destructive",
      secondary: "stroke-secondary",
      ghost: "stroke-accent",
    },
    size: {
      default: "h-5 w-5",
      md: "h-10 w-10",
      lg: "h-60 w-60",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  asChild?: boolean;
}

function Loader({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof loaderVariants> &
  LoaderProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className="flex items-center justify-center" {...props}>
      <style>
        {`
                .spinner {
                  animation: animate-rotate 2s linear infinite;
                  z-index: 2;
                  max-width: 5rem;
                  max-height: 5rem;

                  .path {
                    stroke-linecap: round;
                    animation: animate-dash 1.75s ease-in-out infinite;
                  }
                }
            `}
      </style>
      {/** biome-ignore lint/a11y/noSvgWithoutTitle: <all> */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={cn(loaderVariants({ variant, size, className }))}
      >
        <g>
          <circle
            cx={12}
            cy={12}
            r={9.5}
            fill="none"
            strokeLinecap="round"
            strokeWidth={3}
          >
            <animate
              attributeName="stroke-dasharray"
              calcMode="spline"
              dur="1.5s"
              keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
              keyTimes="0;0.475;0.95;1"
              repeatCount="indefinite"
              values="0 150;42 150;42 150;42 150"
            />
            <animate
              attributeName="stroke-dashoffset"
              calcMode="spline"
              dur="1.5s"
              keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
              keyTimes="0;0.475;0.95;1"
              repeatCount="indefinite"
              values="0;-16;-59;-59"
            />
          </circle>
          <animateTransform
            attributeName="transform"
            dur="2s"
            repeatCount="indefinite"
            type="rotate"
            values="0 12 12;360 12 12"
          />
        </g>
      </svg>
    </Comp>
  );
}

export { Loader, loaderVariants };
