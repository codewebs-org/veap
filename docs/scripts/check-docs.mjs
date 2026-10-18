#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(here, "..");
const developerDocsRoot = path.resolve(docsDir, "developer-docs");
const maintainerNotesRoot = path.resolve(docsDir, "maintainer-notes");
const errors = [];
const markdownFiles = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".md")) markdownFiles.push(full);
  }
}

walk(developerDocsRoot);
walk(maintainerNotesRoot);
const rootDocsReadme = path.join(docsDir, "README.md");
if (fs.existsSync(rootDocsReadme)) {
  markdownFiles.push(rootDocsReadme);
}

const headingCache = new Map();

function slugifyHeading(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getHeadingsForFile(filePath) {
  if (headingCache.has(filePath)) return headingCache.get(filePath);
  const slugs = new Set();
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    headingCache.set(filePath, slugs);
    return slugs;
  }
  const content = fs.readFileSync(filePath, "utf8");
  const counts = new Map();
  let inFence = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^(`{3,}|~{3,})/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      const base = slugifyHeading(match[1]);
      if (!base) continue;
      const count = counts.get(base) ?? 0;
      counts.set(base, count + 1);
      slugs.add(count === 0 ? base : `${base}-${count}`);
    }
  }
  headingCache.set(filePath, slugs);
  return slugs;
}

for (const file of markdownFiles) {
  const source = fs.readFileSync(file, "utf8");
  const strippedSource = source
    .replace(/^(`{3,}|~{3,})[\s\S]*?^\1/gm, "")
    .replace(/`[^`\n]+`/g, "");
  const linkPattern = /(?<!!)\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of strippedSource.matchAll(linkPattern)) {
    const rawTarget = match[1].trim().split(/\s+/, 1)[0].replace(/^<|>$/g, "");
    if (!rawTarget || /^(https?:|mailto:|tel:)/i.test(rawTarget)) continue;

    const [pathPart, hashPart] = rawTarget.split("#", 2);
    const targetFile = pathPart
      ? path.resolve(path.dirname(file), pathPart)
      : file;

    if (!fs.existsSync(targetFile)) {
      errors.push(`${path.relative(here, file)}: broken link ${rawTarget}`);
      continue;
    }

    if (hashPart && targetFile.endsWith(".md")) {
      const slugs = getHeadingsForFile(targetFile);
      if (!slugs.has(hashPart.toLowerCase())) {
        errors.push(
          `${path.relative(here, file)}: broken anchor #${hashPart} in ${pathPart || path.basename(file)}`,
        );
      }
    }
  }
}

function validateMeta(dir) {
  const metaPath = path.join(dir, "meta.json");
  if (!fs.existsSync(metaPath)) {
    errors.push(`${path.relative(here, dir)}: missing meta.json`);
    return;
  }
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    errors.push(`${path.relative(here, metaPath)}: invalid JSON`);
    return;
  }
  if (!Array.isArray(meta.pages)) {
    errors.push(`${path.relative(here, metaPath)}: pages must be an array`);
    return;
  }

  const listedPages = new Set(meta.pages);
  for (const page of meta.pages) {
    if (typeof page !== "string") {
      errors.push(
        `${path.relative(here, metaPath)}: page entries must be strings`,
      );
      continue;
    }
    const asFile = path.join(dir, `${page}.md`);
    const asDir = path.join(dir, page);
    if (!fs.existsSync(asFile) && !fs.existsSync(asDir)) {
      errors.push(
        `${path.relative(here, metaPath)}: missing page or folder ${page}`,
      );
    } else if (fs.existsSync(asDir) && fs.statSync(asDir).isDirectory()) {
      validateMeta(asDir);
    }
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const pageName = entry.name.slice(0, -3);
      if (!listedPages.has(pageName)) {
        errors.push(
          `${path.relative(here, metaPath)}: orphaned markdown file ${entry.name} not listed in pages`,
        );
      }
    }
  }
}

validateMeta(developerDocsRoot);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${markdownFiles.length} Markdown files, anchor fragments, and navigation metadata.`,
  );
}
