/**
 * Minimal allow-list HTML sanitiser for admin-authored rich text.
 * Keeps basic formatting tags and safe links; drops everything else (incl. attributes and scripts).
 */
const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "h2", "h3", "h4", "a", "blockquote", "hr", "table", "thead", "tbody", "tr", "th", "td"]);

export function sanitizeHtml(input: string): string {
  let html = input.replace(/<(script|style|iframe|object|embed|template|noscript)[\s\S]*?<\/\1\s*>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED.has(tag)) return "";
    const closing = full.startsWith("</");
    if (closing) return `</${tag}>`;
    if (tag === "a") {
      const m = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = (m?.[2] ?? m?.[3] ?? m?.[4] ?? "").trim();
      if (/^(https?:|mailto:|tel:|\/|#)/i.test(href) && !/^\/\//.test(href)) return `<a href="${href.replace(/"/g, "&quot;")}">`;
      return "<a>";
    }
    return `<${tag}>`;
  });
  return html.trim();
}

/** Converts plain text with blank lines into paragraphs when no HTML tags are present. */
export function textToHtml(input: string) {
  if (/<[a-z][\s\S]*>/i.test(input)) return sanitizeHtml(input);
  return input
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}
