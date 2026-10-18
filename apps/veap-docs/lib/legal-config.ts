import type { TocHeading } from "@/lib/docs-data";

export type LegalDocIcon =
  | "lock"
  | "scale"
  | "shield"
  | "git-branch"
  | "file-text"
  | "users";

export interface LegalDocMetadata {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  badge: string;
  icon: LegalDocIcon;
  href: string;
}

export const LEGAL_DOCS_CONFIG: LegalDocMetadata[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy",
    category: "Privacy & Data",
    badge: "Zero Tracking",
    icon: "lock",
    href: "/privacy",
  },
  {
    slug: "terms",
    title: "Terms of Use",
    shortTitle: "Terms",
    category: "Terms & Agreements",
    badge: "General Terms",
    icon: "scale",
    href: "/terms",
  },
  {
    slug: "security-policy",
    title: "Security Policy",
    shortTitle: "Security",
    category: "Security & Reporting",
    badge: "Responsible Disclosure",
    icon: "shield",
    href: "/security-policy",
  },
  {
    slug: "contributing",
    title: "Contributing Guide",
    shortTitle: "Contributing",
    category: "Community & Code",
    badge: "Developer Guide",
    icon: "git-branch",
    href: "/contributing",
  },
  {
    slug: "license",
    title: "License",
    shortTitle: "MIT License",
    category: "Licensing",
    badge: "Open Source",
    icon: "file-text",
    href: "/license",
  },
  {
    slug: "code-of-conduct",
    title: "Code of Conduct",
    shortTitle: "Conduct",
    category: "Community Standards",
    badge: "Contributor Covenant",
    icon: "users",
    href: "/code-of-conduct",
  },
];

export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  description: string;
  intro?: string;
  content: string;
  readingTime: string;
  wordCount: number;
  headings: TocHeading[];
  meta: LegalDocMetadata;
  prevDoc?: LegalDocMetadata;
  nextDoc?: LegalDocMetadata;
}

export const SUPPORT_EMAIL = "contact@veap.pl";

export const BUSINESS_OWNER = "Veap Core Team";

export const BUSINESS_COUNTRY = "Poland";

export const GOVERNING_LAW = `the laws of ${BUSINESS_COUNTRY} and the European Union`;

export const JURISDICTION = `the courts of ${BUSINESS_COUNTRY}`;

export const DISPUTE_WINDOW = "30 days";
