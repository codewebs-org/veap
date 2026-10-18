import fs from "node:fs";
import path from "node:path";
import type { UserConfig } from "@commitlint/types";

function getDirs(dirPath: string): string[] {
  const fullPath = path.resolve(import.meta.dirname, dirPath);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readdirSync(fullPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function getRegistryPluginIds(): string[] {
  try {
    const regPath = path.resolve(
      import.meta.dirname,
      "apps/veap-docs/veap-registry.json",
    );
    if (fs.existsSync(regPath)) {
      const parsed = JSON.parse(fs.readFileSync(regPath, "utf8"));
      if (Array.isArray(parsed.items)) {
        return parsed.items
          .map((item: { id?: string; slug?: string }) => item.slug || item.id)
          .filter((id): id is string => typeof id === "string");
      }
    }
  } catch {}
  return [];
}

const packages = getDirs("packages");
const plugins = [
  ...new Set([...getDirs("plugins"), ...getRegistryPluginIds()]),
];
const apps = [
  ...new Set([
    ...getDirs("apps"),
    "01-base",
    "03-rest-api",
    "04-blog",
    "05_fullstack",
    "veap-docs",
  ]),
];

const shortenedPlugins = plugins.map((p) => p.replace(/-plugin$/, ""));
const shortenedTraits = packages
  .filter((p) => p.startsWith("veap-"))
  .map((p) => p.replace(/^veap-/, ""));
const shortenedApps = apps.map((a) => a.replace(/^[0-9]+[-_]/, ""));

const allowedScopes = [
  ...new Set([
    ...packages,
    ...shortenedTraits,
    ...plugins,
    ...shortenedPlugins,
    ...apps,
    ...shortenedApps,
    "docs",
    "repo",
    "release",
    "deps",
    "ci",
    "tooling",
    "config",
    "testing",
    "scaffold",
    "templates",
  ]),
];

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", allowedScopes],
    "scope-case": [2, "always", ["lower-case", "kebab-case"]],
    "subject-max-length": [0],
    "body-max-line-length": [0],
    "header-max-length": [0],
  },
};

export default Configuration;
