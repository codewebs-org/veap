import { plugins, REGISTRY_HOMEPAGE } from "@/lib/plugins";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const PluginSections = plugins.map((item) => {
    const lines = [
      `### ${item.name} (${item.package})`,
      "",
      `- Page: ${SITE_URL}${item.href}`,
      `- Version: ${item.version}`,
      `- Category: ${item.category}`,
      `- Description: ${item.description}`,
      `- Purpose: ${item.purpose}`,
      `- Install: \`${item.installation.command}\``,
      `- Repository: ${item.contact.repository}`,
    ];

    if (item.dependencies.veap.length) {
      lines.push(`- Veap Dependencies: ${item.dependencies.veap.join(", ")}`);
    }
    if (item.dependencies.packages.length) {
      lines.push(`- Packages: ${item.dependencies.packages.join(", ")}`);
    }
    return lines.join("\n");
  });

  const body = [
    "# Veap Plugin Registry",
    "",
    "> Official registry of Veap packages for Next.js 16: plugins (IPlugin manifests, virtual routing, migrations, hooks, widgets and UI extensions) and the ORM trait packages that add translations, tags, categories and comments to a model.",
    "",
    "Install any entry through the Veap CLI (each entry lists its own command):",
    "",
    "```",
    "bun veap add @veap/blog-plugin",
    "```",
    "",
    `Source code repository: ${REGISTRY_HOMEPAGE}`,
    "",
    "## Available Plugins & ORM Trait Packages",
    "",
    PluginSections.join("\n\n"),
    "",
    "## Notes",
    "",
    "- All entries follow the @veap/plugins contract (IPlugin interface, migrations, event listeners, extension points and widgets).",
    "- Open source under the MIT license.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
