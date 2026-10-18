import registryData from "../veap-registry.json";

export type PluginCategory =
  | "security"
  | "content"
  | "admin"
  | "media"
  | "orm"
  | "system"
  | "dev"
  | "templates";

export const CATEGORY_LABELS: Record<PluginCategory, string> = {
  content: "Content & Publishing",
  security: "Security & Authentication",
  admin: "Admin & Dashboard",
  media: "Media & Storage",
  orm: "ORM & Data Modeling",
  system: "System & Automation",
  dev: "Developer Tools",
  templates: "Starter Templates",
};

export const CATEGORY_ORDER: PluginCategory[] = [
  "content",
  "security",
  "admin",
  "media",
  "orm",
  "system",
  "dev",
  "templates",
];

export interface PluginAuthor {
  name: string;
  role: string;
  url?: string;
}

export interface PluginCredit {
  name: string;
  reason: string;
  url?: string;
}

export interface PluginDependencies {
  core: string;
  veap: string[];
  packages: string[];
}

export interface PluginInstallation {
  command: string;
  steps: string[];
}

export interface PluginContact {
  repository: string;
  issues: string;
  website?: string;
}

export interface VeapPlugin {
  id: string;
  slug: string;
  name: string;
  package: string;
  version: string;
  category: PluginCategory;
  type: "plugin" | "template";
  isNew?: boolean;
  featured?: boolean;
  status?: "official" | "stable" | "beta";
  hasMigrations?: boolean;
  description: string;
  purpose: string;
  installation: PluginInstallation;
  dependencies: PluginDependencies;
  authors: PluginAuthor[];
  credits?: PluginCredit[];
  license: string;
  keepInMind: string[];
  contact: PluginContact;
  usage: string;
  href: string;
}

// Alias for backward compatibility with existing components
export type PluginId = VeapPlugin;

export const REGISTRY_HOMEPAGE = "https://github.com/veapjs/veap";
export const REGISTRY_REPO = "veapjs/veap";
export const REGISTRY_URL = "https://veap.pl/schema/registry.json";

export const plugins: VeapPlugin[] = (registryData.items as VeapPlugin[]).map(
  (item) => ({
    ...item,
    href: `/plugins/${item.slug || item.id}`,
  }),
);

export function getPlugins(): VeapPlugin[] {
  return plugins;
}

export function getPluginBySlug(slug: string): VeapPlugin | undefined {
  return plugins.find((p) => p.slug === slug || p.id === slug);
}

export function getFeaturedPlugins(): VeapPlugin[] {
  return plugins.filter((p) => p.featured);
}

export function getAllPluginSlugs(): string[] {
  return plugins.map((p) => p.slug);
}

export type PluginSection = {
  id: string;
  label: string;
  items: VeapPlugin[];
};

// Strictly category-based sections to eliminate duplicate listings
export const gallerySections: PluginSection[] = CATEGORY_ORDER.map((id) => ({
  id,
  label: CATEGORY_LABELS[id],
  items: plugins.filter((c) => c.category === id),
})).filter((section) => section.items.length > 0);

export function activePlugin(pathname: string): VeapPlugin | undefined {
  return plugins.find((c) => c.href === pathname);
}
