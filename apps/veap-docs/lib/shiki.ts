import { codeToHtml } from "shiki";

// Normalize common language aliases to Shiki supported languages
export function normalizeLanguage(lang?: string): string {
  if (!lang) return "text";
  const clean = lang.toLowerCase().trim();

  const aliasMap: Record<string, string> = {
    js: "javascript",
    javascript: "javascript",
    ts: "typescript",
    typescript: "typescript",
    tsx: "tsx",
    jsx: "jsx",
    sh: "bash",
    shell: "bash",
    bash: "bash",
    zsh: "bash",
    env: "dotenv",
    dotenv: "dotenv",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    markdown: "markdown",
    mdx: "mdx",
    json: "json",
    sql: "sql",
    html: "html",
    css: "css",
    diff: "diff",
    docker: "dockerfile",
    dockerfile: "dockerfile",
    mermaid: "mermaid",
    plaintext: "text",
    txt: "text",
    text: "text",
  };

  return aliasMap[clean] || clean;
}

export type ShikiThemeConfig =
  | string
  | {
      light: string;
      dark: string;
    };

export const DEFAULT_SHIKI_THEMES = {
  light: "github-light-default",
  dark: "github-dark-default",
};

export async function highlightCode(
  code: string,
  lang: string = "typescript",
  themeOrThemes: ShikiThemeConfig = DEFAULT_SHIKI_THEMES,
): Promise<string> {
  const normalizedLang = normalizeLanguage(lang);
  const themeOptions =
    typeof themeOrThemes === "string"
      ? { theme: themeOrThemes }
      : {
          themes: {
            light: themeOrThemes.light,
            dark: themeOrThemes.dark,
          },
        };

  try {
    return await codeToHtml(code.trimEnd(), {
      lang: normalizedLang,
      ...themeOptions,
    });
  } catch {
    // If language is not recognized or loading fails, fallback to 'text'
    try {
      return await codeToHtml(code.trimEnd(), {
        lang: "text",
        ...themeOptions,
      });
    } catch {
      // Manual escape if even text fails
      const escaped = code
        .trimEnd()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre class="shiki" tabindex="0"><code><span class="line"><span>${escaped}</span></span></code></pre>`;
    }
  }
}
