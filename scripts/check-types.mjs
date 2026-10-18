#!/usr/bin/env node
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, "..");
const tscBin = path.resolve(rootDir, "node_modules/.bin/tsc");

if (!fs.existsSync(tscBin)) {
  console.error("❌ TypeScript binary not found in node_modules/.bin/tsc");
  process.exit(1);
}

// Ensure package declaration files (.d.ts) exist before checking dependents
const kernelDts = path.resolve(rootDir, "packages/kernel/dist/index.d.ts");
if (!fs.existsSync(kernelDts)) {
  console.log(
    "📦 Core package declarations missing; building packages first...",
  );
  const { execSync } = await import("node:child_process");
  try {
    execSync("bun run build:packages", { cwd: rootDir, stdio: "inherit" });
  } catch (_err) {
    console.error("❌ Failed to pre-build packages for type declarations.");
    process.exit(1);
  }
}

const targets = [];
const scanGroups = ["packages", "plugins", "apps"];

for (const group of scanGroups) {
  const groupDir = path.resolve(rootDir, group);
  if (!fs.existsSync(groupDir)) continue;

  const entries = fs.readdirSync(groupDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const wsDir = path.join(groupDir, entry.name);
    const tsconfig = path.join(wsDir, "tsconfig.json");
    if (fs.existsSync(tsconfig)) {
      targets.push({
        group,
        name: entry.name,
        dir: wsDir,
        rel: `${group}/${entry.name}`,
      });
    }
  }
}

console.log(`Checking TypeScript types across ${targets.length} workspaces...`);

const concurrency = Math.min(os.cpus().length || 4, 8);
let active = 0;
let nextIndex = 0;
const failures = [];
let passedCount = 0;

function runNext() {
  if (nextIndex >= targets.length) {
    if (active === 0) finish();
    return;
  }

  const target = targets[nextIndex++];
  active++;

  execFile(
    tscBin,
    ["--noEmit"],
    { cwd: target.dir, env: process.env },
    (error, stdout, stderr) => {
      active--;
      if (error) {
        failures.push({ target, output: stdout || stderr || error.message });
        process.stdout.write("✗");
      } else {
        passedCount++;
        process.stdout.write("✓");
      }
      runNext();
    },
  );
}

function finish() {
  console.log("\n");
  if (failures.length > 0) {
    console.error(`❌ Type-check failed in ${failures.length} workspace(s):\n`);
    for (const f of failures) {
      console.error(`--- [${f.target.rel}] ---`);
      console.error(f.output.trim());
      console.error("");
    }
    process.exit(1);
  } else {
    console.log(
      `✅ All ${passedCount} workspaces passed TypeScript verification without errors!`,
    );
    process.exit(0);
  }
}

// Start pool
const poolSize = Math.min(concurrency, targets.length);
for (let i = 0; i < poolSize; i++) {
  runNext();
}
