#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, "..");
const packagesDir = path.resolve(rootDir, "packages");

const errors = [];

function error(rule, message) {
  errors.push(`[${rule}] ${message}`);
}

function readFile(relPath) {
  const fullPath = path.resolve(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    error("FILE_NOT_FOUND", `File ${relPath} does not exist`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function readJson(relPath) {
  const content = readFile(relPath);
  try {
    return JSON.parse(content);
  } catch (err) {
    error("JSON_PARSE", `Failed to parse ${relPath}: ${err.message}`);
    return {};
  }
}

// -----------------------------------------------------------------------------
// Rule 1: @veap/kernel Framework Independence
// -----------------------------------------------------------------------------
function checkKernelFrameworkIndependence() {
  const kernelSrc = path.resolve(packagesDir, "kernel/src");
  const nextDir = path.resolve(kernelSrc, "next");

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (full === nextDir) continue; // Isolated Next.js adapter is allowed
        walk(full);
      } else if (entry.name.endsWith(".ts")) {
        const content = fs.readFileSync(full, "utf8");
        const rel = path.relative(rootDir, full);
        if (/from\s+["']next(\/.*)?["']/.test(content)) {
          error(
            "KERNEL_FRAMEWORK_INDEPENDENCE",
            `${rel} imports from 'next'. Framework adapters must be isolated to 'packages/kernel/src/next/'.`,
          );
        }
      }
    }
  }

  walk(kernelSrc);
}

// -----------------------------------------------------------------------------
// Rule 2: @veap/auth Client/Server Isolation
// -----------------------------------------------------------------------------
function checkAuthIsolation() {
  const authIndex = readFile("packages/auth/src/index.ts");
  if (authIndex.includes("./client/") || authIndex.includes("./client.js")) {
    error(
      "AUTH_CLIENT_SERVER_ISOLATION",
      "packages/auth/src/index.ts must not export client context or hooks (use @veap/auth/client).",
    );
  }

  const clientDir = path.resolve(packagesDir, "auth/src/client");
  function walkClient(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkClient(full);
      else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = fs.readFileSync(full, "utf8");
        if (
          content.includes('from "node:crypto"') ||
          content.includes("from 'node:crypto'") ||
          content.includes('from "bcryptjs"') ||
          content.includes("from 'bcryptjs'") ||
          content.includes('from "../server"') ||
          content.includes("from '../server'")
        ) {
          const rel = path.relative(rootDir, full);
          error(
            "AUTH_CLIENT_LEAK",
            `${rel} in @veap/auth/client imports Node-only crypto or server internals.`,
          );
        }
      }
    }
  }
  walkClient(clientDir);
}

// -----------------------------------------------------------------------------
// Rule 3: @veap/plugins CLI Isolation & Dead Code
// -----------------------------------------------------------------------------
function checkPluginsIsolation() {
  const pluginsIndex = readFile("packages/plugins/src/index.ts");
  if (pluginsIndex.includes("./cli/")) {
    error(
      "PLUGINS_CLI_ISOLATION",
      "packages/plugins/src/index.ts must not export CLI commands (use @veap/plugins/cli).",
    );
  }

  const pluginsSrc = path.resolve(packagesDir, "plugins/src");
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = fs.readFileSync(full, "utf8");
        if (content.includes("@veap/framework")) {
          const rel = path.relative(rootDir, full);
          error(
            "PLUGINS_DEAD_CODE",
            `${rel} references non-existent package '@veap/framework'.`,
          );
        }
      }
    }
  }
  walk(pluginsSrc);
}

// -----------------------------------------------------------------------------
// Rule 4: Clean Dependencies in ORM Traits
// -----------------------------------------------------------------------------
function checkOrmTraitsDependencies() {
  const traitPackages = [
    "packages/veap-categorizable",
    "packages/veap-taggable",
    "packages/veap-commentable",
  ];

  for (const pkg of traitPackages) {
    const pkgJson = readJson(`${pkg}/package.json`);
    const deps = pkgJson.dependencies || {};
    if (deps["@faker-js/faker"]) {
      error(
        "ORM_TRAITS_DEPENDENCIES",
        `${pkg}/package.json contains '@faker-js/faker' in dependencies. It must be in devDependencies only.`,
      );
    }
  }

  const commentableJson = readJson("packages/veap-commentable/package.json");
  if (commentableJson.dependencies?.["@veap/auth"]) {
    error(
      "COMMENTABLE_DECOUPLING",
      "packages/veap-commentable/package.json must not have a hard dependency on '@veap/auth' in dependencies (use peerDependencies).",
    );
  }
}

// -----------------------------------------------------------------------------
// Rule 5: UI Isolation
// -----------------------------------------------------------------------------
function checkUiIsolation() {
  const uiIndex = readFile("packages/ui/src/index.ts");
  if (uiIndex.includes("./mdx")) {
    error(
      "UI_MDX_ISOLATION",
      "packages/ui/src/index.ts must not export MDX components directly (use @veap/ui/mdx).",
    );
  }

  const traitPackages = [
    "packages/veap-categorizable",
    "packages/veap-taggable",
    "packages/veap-commentable",
    "packages/veap-translatable",
  ];

  for (const pkg of traitPackages) {
    const indexContent = readFile(`${pkg}/src/index.ts`);
    if (indexContent.includes("./ui/")) {
      error(
        "TRAIT_UI_ISOLATION",
        `${pkg}/src/index.ts must not export UI components from root entrypoint (use ${pkg}/ui).`,
      );
    }
  }
}

// -----------------------------------------------------------------------------
// Rule 6: DIP in @veap/mail (No Auth Coupling)
// -----------------------------------------------------------------------------
function checkMailCoupling() {
  const mailSrc = path.resolve(packagesDir, "mail/src");
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts")) {
        const content = fs.readFileSync(full, "utf8");
        if (/from\s+["']@veap\/auth(\/.*)?["']/.test(content)) {
          const rel = path.relative(rootDir, full);
          error(
            "MAIL_AUTH_DIP",
            `${rel} imports from '@veap/auth'. Mail package must remain pure transport infrastructure.`,
          );
        }
      }
    }
  }
  walk(mailSrc);
}

// Run all checks
console.log("Checking architectural boundary invariants across /packages/...");
checkKernelFrameworkIndependence();
checkAuthIsolation();
checkPluginsIsolation();
checkOrmTraitsDependencies();
checkUiIsolation();
checkMailCoupling();

if (errors.length > 0) {
  console.error(`\n❌ Architectural violations found (${errors.length}):\n`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log(
    "✅ All architectural boundaries and invariants verified successfully!",
  );
  process.exit(0);
}
