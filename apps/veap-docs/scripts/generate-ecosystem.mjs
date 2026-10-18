#!/usr/bin/env node
/**
 * Generates `lib/ecosystem.generated.json`: the package facts the homepage
 * prints, the registry table, and the ownership map behind
 * `docs/developer-docs/getting-started/project-structure.md`.
 *
 * Mechanical facts (versions, entry points, dependencies, licences) come from
 * `packages/*​/package.json` and `veap-registry.json`, so the page cannot drift
 * from the published manifests. Only the human-readable bits (blurb, docs link,
 * provider symbols) are curated below, and every curated docs link is verified
 * against `docs/developer-docs` so the data can never point at a dead page.
 *
 * The same applies to the ownership rules: each documented path is asserted to
 * exist in the application it was observed in, and the eject walkthrough is
 * checked against the registry entry and the real plugin folder. When a file
 * moves, this script fails loudly instead of letting the documentation describe
 * a layout that no longer exists.
 *
 * Usage:
 *   node scripts/generate-ecosystem.mjs          # write the snapshot
 *   node scripts/generate-ecosystem.mjs --check  # fail when it is out of date
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const packagesDir = path.join(repoRoot, "packages");
const docsRoot = path.join(repoRoot, "docs", "developer-docs");
const registryFile = path.join(appRoot, "veap-registry.json");
const outputFile = path.join(appRoot, "lib", "ecosystem.generated.json");

const checkOnly = process.argv.includes("--check");
const warnings = [];
/** Curated facts that failed verification. Any entry here aborts the write. */
const errors = [];

/** Curated, human-readable metadata. Keys are npm package names. */
const CURATED = {
  "@veap/kernel": {
    kind: "service",
    docs: "/docs/reference/packages/kernel",
    blurb:
      "Application lifecycle, IoC container, validated config, event bus, logging, cache and HTTP contracts.",
    providers: [
      { symbol: "KernelServiceProvider", from: "@veap/kernel/server" },
    ],
  },
  "@veap/database": {
    kind: "service",
    docs: "/docs/reference/packages/database",
    blurb:
      "Active Record ORM with relations, casts, scopes, factories and the reversible migration runner.",
    providers: [
      { symbol: "DatabaseServiceProvider", from: "@veap/database" },
      { symbol: "MigrationServiceProvider", from: "@veap/database" },
    ],
  },
  "@veap/auth": {
    kind: "service",
    docs: "/docs/reference/packages/auth",
    blurb:
      "Users, hashed sessions, roles and permissions, plus Result-based Server Actions and shared Zod schemas.",
    providers: [{ symbol: "AuthServiceProvider", from: "@veap/auth" }],
  },
  "@veap/plugins": {
    kind: "service",
    docs: "/docs/reference/packages/plugins",
    blurb:
      "IPlugin contract, persisted registry, widgets, extension points, navigation and the virtual router.",
    providers: [{ symbol: "PluginsServiceProvider", from: "@veap/plugins" }],
  },
  "@veap/intl": {
    kind: "service",
    docs: "/docs/reference/packages/intl",
    blurb:
      "Locale negotiation and ICU message formatting with separate server and client entry points.",
    providers: [{ symbol: "IntlServiceProvider", from: "@veap/intl/server" }],
  },
  "@veap/mail": {
    kind: "service",
    docs: "/docs/reference/packages/mail",
    blurb:
      "MailMessage and send helpers with SMTP, console or your own transport behind one port.",
    providers: [{ symbol: "MailServiceProvider", from: "@veap/mail" }],
  },
  "@veap/settings": {
    kind: "service",
    docs: "/docs/reference/packages/settings",
    blurb:
      "Runtime-editable key/value settings persisted through the database behind a cache contract.",
    providers: [{ symbol: "SettingsServiceProvider", from: "@veap/settings" }],
  },
  "@veap/storage": {
    kind: "service",
    docs: "/docs/reference/packages/storage",
    blurb:
      "File storage port with a local disk provider and a typed contract for your own adapter.",
    providers: [{ symbol: "StorageServiceProvider", from: "@veap/storage" }],
  },
  "@veap/ui": {
    kind: "ui",
    docs: "/docs/reference/packages/ui",
    blurb:
      "Shared React components, the Tailwind stylesheet and providers. Optional peer of the plugin and trait packages.",
    providers: [],
  },
  "create-veap": {
    kind: "tooling",
    docs: "/docs/packages/create-veap",
    blurb:
      "The project initializer: copies a built-in template into the target folder, rewrites package.json and optionally installs dependencies.",
    providers: [],
  },
  "@veap/translatable": {
    kind: "trait",
    docs: "/docs/packages/orm-traits/translatable",
    blurb:
      "Multilingual field values for any model, stored in one polymorphic translations table.",
    providers: [],
    migrations: true,
  },
  "@veap/taggable": {
    kind: "trait",
    docs: "/docs/packages/orm-traits/taggable",
    blurb: "Free-form tags through shared tags and taggables tables.",
    providers: [],
    migrations: true,
  },
  "@veap/categorizable": {
    kind: "trait",
    docs: "/docs/packages/orm-traits/categorizable",
    blurb:
      "Hierarchical categories over a polymorphic pivot, with a category tree editor.",
    providers: [],
    migrations: true,
  },
  "@veap/commentable": {
    kind: "trait",
    docs: "/docs/packages/orm-traits/commentable",
    blurb:
      "Threaded comments and reviews for any model in one shared comments table.",
    providers: [],
    migrations: true,
  },
};

/**
 * Curated ownership map: which package (or the application itself) owns which
 * file in a working Veap application. `source` names where the path was
 * observed, and every rule is asserted to exist there, so this tree can never
 * describe a file layout that no longer exists.
 *
 * `owner` is either a package name from `packages/ *` (the docs link is then the
 * package's own curated reference page) or one of the synthetic owners below.
 */
const APPLICATION_DOCS = "/docs/getting-started/project-structure";
const GENERATED_DOCS = "/docs/reference/plugins/cli";
const OWNERSHIP_REFERENCE = "apps/01-base";

const OWNERSHIP_RULES = [
  {
    path: "app/layout.tsx",
    owner: "application",
    role: "Root shell. Awaits initializeSystem() before rendering, and pins the route to force-dynamic so the build never boots the kernel.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "lib/veap.ts",
    owner: "@veap/kernel",
    role: "Composition root: Application.configure().use(...).create() plus the cached initializeSystem() entry point.",
    editable: "you",
    source: "overlay",
  },
  {
    path: "app/api/[...catchAll]/route.ts",
    owner: "@veap/plugins",
    role: "API pipeline: middlewares, auth, roles and permissions resolved from the same route tree.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "app/uploads/[filename]/route.ts",
    owner: "@veap/storage",
    role: "Serves locally stored files after a path-traversal check; swap the provider and this route disappears.",
    editable: "you",
    source: "04-blog",
  },
  {
    path: "app/(site)/page.tsx",
    owner: "application",
    role: "Your screens. Plain App Router components - Veap adds no page wrapper of its own.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "app/actions/auth.ts",
    owner: "application",
    role: "Server Actions using the Result contract and auth helpers; validation ships from the package.",
    editable: "you",
    source: "04-blog",
  },
  {
    path: "lib/veap.ts",
    owner: "application",
    role: "The composition root: Application.configure().use(...).create() plus the cached initializeSystem(). This is the one file that decides what your app is.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "lib/plugins.gen.ts",
    owner: "generated",
    role: "Rewritten by the plugins CLI registry helper. It imports installed plugins statically so the bundler can trace them.",
    editable: "generated",
    source: "01-base",
  },
  {
    path: "lib/host-plugin.ts",
    owner: "application",
    role: "An in-repo plugin: identical IPlugin contract to an npm plugin, no publishing step in between.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "lib/models/article.ts",
    owner: "application",
    role: "Your models extend the database Model; ORM traits are mixins you apply here, not columns you add.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "migrations/index.ts",
    owner: "generated",
    role: "The list handed to the migration runner. Migrations run on startup, so a deploy carries its own schema change.",
    editable: "generated",
    source: "01-base",
  },
  {
    path: "migrations/20261001_create_articles.ts",
    owner: "application",
    role: "One reversible migration per change, generated by the make:migration helper.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "components/site-layout.tsx",
    owner: "@veap/plugins",
    role: "Navbar and footer are extension points: a plugin can take the slot over without touching your layout.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "components/navbar.tsx",
    owner: "application",
    role: "Fallback UI shown inside the single-mode slot when no plugin claims it.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "veap.config.ts",
    owner: "@veap/kernel",
    role: "Validated application config - privatePath, locales, debug - loaded before any provider runs.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "next.config.ts",
    owner: "application",
    role: "Stock Next.js config: you keep the framework's own build, output mode and Turbopack rules.",
    editable: "you",
    source: "01-base",
  },
  {
    path: ".env.example",
    owner: "application",
    role: "Runtime keys, including the ENCRYPTION_KEY the auth package requires - it fails fast at boot when missing.",
    editable: "you",
    source: "01-base",
  },
  {
    path: "locales/en.json",
    owner: "application",
    role: "Message catalogs loaded by the intl provider; the locale list lives in veap.config.ts.",
    editable: "you",
    source: "05_fullstack",
  },
  {
    path: "plugins/blog-plugin",
    owner: "eject",
    role: "An npm plugin after ejection: the same package, cloned into your repository as a workspace package you own.",
    editable: "package",
    source: "repo",
    dir: true,
  },
];

/**
 * Eject demo, verified against the registry entry and the real plugin folder.
 * The step list mirrors the shipped `ejectPackage` implementation: clone the
 * repository, register the workspace, pin the dependency to `workspace:*`, link
 * it with the detected package manager, then regenerate the plugins registry.
 */
const EJECT_TARGET = "@veap/blog-plugin";

const EJECT_TEMPLATE = {
  title: "Eject a plugin",
  steps: [
    "Clone the repository of the installed package into plugins/blog-plugin (the CLI reads repository.url, falling back to the npm registry).",
    'Add "plugins/*" to the workspaces array of the root package.json.',
    'Pin the dependency to "@veap/blog-plugin": "workspace:*".',
    "Run the detected package manager's install so the workspace package is linked.",
    "Regenerate the plugins registry.",
  ],
  files: [
    {
      path: "package.json",
      before: ['"dependencies": {', '  "@veap/blog-plugin": "^0.1.0"', "}"],
      after: [
        '"workspaces": ["plugins/*"],',
        '"dependencies": {',
        '  "@veap/blog-plugin": "workspace:*"',
        "}",
      ],
      note: "The registry version becomes a local link: npm updates can no longer touch the copy you edit.",
    },
    {
      path: "node_modules/@veap/blog-plugin -> plugins/blog-plugin",
      before: [
        "dist/          # compiled, replaced on every install",
        "src/           # not shipped by the published package",
      ],
      after: [
        "src/           # real source, now yours to edit",
        "dist/          # built by your workspace",
        "package.json   # versioned in your repository",
      ],
      note: "Ejection moves the package from a dependency you consume into code you own and commit.",
    },
    {
      path: "lib/plugins.gen.ts",
      before: ['import blogPlugin from "@veap/blog-plugin";'],
      after: ['import blogPlugin from "@veap/blog-plugin";'],
      note: "Regenerated, not rewritten: the specifier is unchanged while its resolution moves to the workspace package.",
    },
  ],
  caveat:
    "PluginsServiceProvider registers the eject command (EjectPluginCommand) in @veap/kernel/cli, and ejectPlugin() is also exported from @veap/plugins/cli. The package must be listed in dependencies and present in node_modules.",
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function docSlugs() {
  const slugs = new Set([""]);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const rel = path.relative(docsRoot, full).split(path.sep).join("/");
        slugs.add(rel.replace(/\.md$/, "").replace(/(^|\/)index$/, ""));
      }
    }
  };
  if (fs.existsSync(docsRoot)) walk(docsRoot);
  return slugs;
}

/** Directories the ownership rules are verified against. */
const OBSERVED_DIRS = {
  "01-base": path.join(repoRoot, "apps", "01-base"),
  "04-blog": path.join(repoRoot, "apps", "04-blog"),
  "05_fullstack": path.join(repoRoot, "apps", "05_fullstack"),
  overlay: path.join(packagesDir, "create-veap", "templates", "01-basic"),
  repo: repoRoot,
};

function observedExists(source, filePath) {
  const base = OBSERVED_DIRS[source];
  if (!base) return false;
  const full = path.join(base, filePath);
  // Scaffold stubs are shipped with a trailing `.stub` extension.
  return fs.existsSync(full) || fs.existsSync(`${full}.stub`);
}

const SYNTHETIC_OWNERS = {
  application: { label: "Your application", docs: APPLICATION_DOCS },
  generated: { label: "Generated", docs: GENERATED_DOCS },
  eject: { label: "Eject target", docs: GENERATED_DOCS },
};

/**
 * The ownership map as a nested tree: every file carries the package or the
 * synthetic owner that writes it, plus whether you may edit it. Directories are
 * inferred from the paths and never claim an owner of their own.
 */
function buildOwnership(packages, slugs, registryItems) {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const flat = [];

  for (const rule of OWNERSHIP_RULES) {
    if (!observedExists(rule.source, rule.path)) {
      errors.push(
        `ownership: ${rule.path} was not found in ${rule.source} (${OBSERVED_DIRS[rule.source] ?? "unknown source"})`,
      );
      continue;
    }

    const pkg = byName.get(rule.owner);
    const synthetic = SYNTHETIC_OWNERS[rule.owner];
    if (!pkg && !synthetic) {
      errors.push(`ownership: ${rule.path} has unknown owner ${rule.owner}`);
      continue;
    }

    const docs = pkg ? pkg.docs : synthetic.docs;
    const slug = docs.replace(/^\/docs\/?/, "");
    if (slugs.size > 1 && !slugs.has(slug)) {
      errors.push(`ownership: ${rule.path} docs link ${docs} does not exist`);
    }

    flat.push({
      path: rule.path,
      owner: rule.owner,
      ownerLabel: pkg ? pkg.name : synthetic.label,
      ownerKind: pkg ? pkg.kind : "app",
      role: rule.role,
      editable: rule.editable,
      docs,
      source: rule.source,
      // A rule may point at a folder that is itself ejectable.
      folder: Boolean(rule.dir),
    });
  }

  const root = { children: [] };
  for (const file of flat) {
    const parts = file.path.split("/");
    let node = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const partial = parts.slice(0, index + 1).join("/");
      let child = node.children.find((entry) => entry.name === parts[index]);
      if (!child) {
        child = { name: parts[index], path: partial, dir: true, children: [] };
        node.children.push(child);
      }
      node = child;
    }
    const { folder, ...entry } = file;
    node.children.push({
      name: parts[parts.length - 1],
      dir: Boolean(folder),
      children: [],
      ...entry,
    });
  }

  // Directories first, authoring order otherwise (Array#sort is stable).
  const order = (nodes) => {
    nodes.sort((a, b) => Number(b.dir) - Number(a.dir));
    for (const node of nodes) order(node.children);
  };
  order(root.children);

  return {
    reference: OWNERSHIP_REFERENCE,
    files: flat.length,
    owners: [...new Set(flat.map((file) => file.owner))].sort(),
    nodes: root.children,
    eject: buildEject(registryItems),
  };
}

/** The eject walkthrough, verified against the registry entry and the real folder. */
function buildEject(registryItems) {
  const entry = registryItems.find((item) => item.package === EJECT_TARGET);
  if (!entry) {
    errors.push(`eject: registry has no entry for ${EJECT_TARGET}`);
    return null;
  }
  if (!entry.repository) {
    errors.push(`eject: registry entry ${EJECT_TARGET} has no repository URL`);
    return null;
  }

  const folder = EJECT_TARGET.replace(/^@[^/]+\//, "");
  const dir = `plugins/${folder}`;
  if (!fs.existsSync(path.join(repoRoot, dir))) {
    errors.push(`eject: ${dir} does not exist in this repository`);
    return null;
  }

  return {
    target: EJECT_TARGET,
    label: entry.name,
    version: entry.version,
    dir,
    repository: entry.repository,
    install: entry.install,
    ...EJECT_TEMPLATE,
  };
}

function buildSnapshot() {
  if (!fs.existsSync(packagesDir)) {
    return null;
  }

  const slugs = docSlugs();
  const packages = [];

  for (const dir of fs.readdirSync(packagesDir).sort()) {
    const manifestFile = path.join(packagesDir, dir, "package.json");
    if (!fs.existsSync(manifestFile)) continue;

    const manifest = readJson(manifestFile);
    const curated = CURATED[manifest.name];
    if (!curated) {
      warnings.push(`${manifest.name}: no curated metadata, skipped`);
      continue;
    }
    if (slugs.size > 1 && !slugs.has(curated.docs.replace(/^\/docs\/?/, ""))) {
      errors.push(`${manifest.name}: docs link ${curated.docs} does not exist`);
    }

    const deps = Object.keys(manifest.dependencies ?? {})
      .filter((name) => name.startsWith("@veap/"))
      .sort();
    const peers = Object.keys(manifest.peerDependencies ?? {})
      .filter((name) => name.startsWith("@veap/"))
      .sort();
    const subpaths = Object.keys(manifest.exports ?? {})
      .filter((key) => key !== "." && key !== "./package.json")
      .sort();

    packages.push({
      name: manifest.name,
      version: manifest.version,
      kind: curated.kind,
      license: manifest.license ?? null,
      repository: manifest.repository?.url ?? null,
      dir,
      docs: curated.docs,
      blurb: curated.blurb,
      providers: curated.providers,
      migrations: Boolean(curated.migrations),
      deps,
      peers,
      exports: subpaths,
      exportCount: subpaths.length,
      private: Boolean(manifest.private),
    });
  }

  // Longest path from the dependency roots, memoised: a package sits one layer
  // above its deepest Veap dependency (memoising also keeps repeated deps exact).
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const layersByName = new Map();
  const layerOf = (name) => {
    if (layersByName.has(name)) return layersByName.get(name);
    const pkg = byName.get(name);
    if (!pkg || pkg.deps.length === 0) {
      layersByName.set(name, 0);
      return 0;
    }
    layersByName.set(name, 0); // provisional value, also breaks accidental cycles
    const depth = 1 + Math.max(...pkg.deps.map((dep) => layerOf(dep)));
    layersByName.set(name, depth);
    return depth;
  };
  for (const pkg of packages) pkg.layer = layerOf(pkg.name);

  packages.sort((a, b) => a.layer - b.layer || a.name.localeCompare(b.name));

  const layers = [];
  for (const pkg of packages) {
    const row = layers.find((entry) => entry.depth === pkg.layer);
    if (row) row.packages.push(pkg.name);
    else layers.push({ depth: pkg.layer, packages: [pkg.name] });
  }

  const registry = readJson(registryFile);
  const registryItems = registry.items.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    package: item.package,
    version: item.version,
    category: item.category,
    status: item.status ?? "official",
    kind: item.category === "orm" ? "trait" : "plugin",
    featured: Boolean(item.featured),
    isNew: Boolean(item.isNew),
    install: item.installation?.command ?? null,
    hasMigrations: Boolean(item.hasMigrations),
    repository: item.contact?.repository ?? null,
    docs: `/plugins/${item.slug || item.id}`,
    dependencies: (item.dependencies?.veap ?? []).slice().sort(),
  }));

  const count = (kind) => packages.filter((pkg) => pkg.kind === kind).length;

  // Demo applications in this repository: named only, so the landing page can
  // tease them without inventing what they demonstrate.
  const demos = [];
  const appsDir = path.join(repoRoot, "apps");
  if (fs.existsSync(appsDir)) {
    for (const dir of fs.readdirSync(appsDir).sort()) {
      const manifestFile = path.join(appsDir, dir, "package.json");
      if (!fs.existsSync(manifestFile)) continue;
      const manifest = readJson(manifestFile);
      if (/docs$|website$/i.test(dir)) continue;
      const veapDeps = Object.keys(manifest.dependencies ?? {})
        .filter((name) => name.startsWith("@veap/"))
        .sort();
      demos.push({
        dir,
        package: manifest.name,
        veapDeps,
      });
    }
  }

  return {
    generatedFrom: "packages/*/package.json + veap-registry.json",
    totals: {
      packages: packages.length,
      services: count("service"),
      ui: count("ui"),
      tooling: count("tooling"),
      traits: count("trait"),
      exportSubpaths: packages.reduce((sum, pkg) => sum + pkg.exportCount, 0),
      registryEntries: registryItems.length,
      plugins: registryItems.filter((item) => item.kind === "plugin").length,
    },
    layers,
    packages,
    registry: registryItems,
    demos,
    ownership: buildOwnership(packages, slugs, registryItems),
  };
}

const snapshot = buildSnapshot();

if (errors.length > 0) {
  for (const error of errors) console.error(`[ecosystem] ${error}`);
  console.error(
    "[ecosystem] snapshot not written: fix the curated metadata above.",
  );
  process.exitCode = 1;
} else if (!snapshot) {
  if (checkOnly) {
    console.error(
      `Cannot verify the ecosystem snapshot: ${packagesDir} is not available (deploying from a subdirectory?).`,
    );
    process.exitCode = 1;
  } else {
    const exists = fs.existsSync(outputFile);
    console.warn(
      `[ecosystem] ${packagesDir} not found - keeping the committed snapshot${exists ? "" : " (none exists!)"}.`,
    );
    if (!exists) process.exitCode = 1;
  }
} else {
  const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
  const current = fs.existsSync(outputFile)
    ? fs.readFileSync(outputFile, "utf8")
    : null;

  if (checkOnly) {
    if (current !== serialized) {
      console.error(
        "Ecosystem snapshot is out of date. Run: node scripts/generate-ecosystem.mjs",
      );
      process.exitCode = 1;
    } else if (snapshot.totals.packages === 0) {
      console.error("Ecosystem snapshot is empty.");
      process.exitCode = 1;
    } else {
      console.log(
        `Ecosystem snapshot is up to date: ${snapshot.totals.packages} packages, ${snapshot.totals.registryEntries} registry entries.`,
      );
    }
  } else {
    fs.writeFileSync(outputFile, serialized);
    console.log(
      `[ecosystem] wrote ${path.relative(repoRoot, outputFile)}: ` +
        `${snapshot.totals.packages} packages (${snapshot.totals.services} services, ` +
        `${snapshot.totals.traits} traits, ${snapshot.totals.ui} ui, ${snapshot.totals.tooling} tooling), ` +
        `${snapshot.totals.exportSubpaths} export subpaths, ` +
        `${snapshot.totals.registryEntries} registry entries (${snapshot.totals.plugins} plugins).`,
    );
  }
}

for (const warning of warnings) console.warn(`[ecosystem] ${warning}`);
