import SquircleButton from "@/components/SquircleButton";

export default function SponsorCta({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "subtle";
  className?: string;
}) {
  return (
    <SquircleButton
      href={href}
      variant={variant === "solid" ? "primary" : "subtle"}
      className={className}
    >
      {children}
    </SquircleButton>
  );
}
