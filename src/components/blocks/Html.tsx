import clsx from "clsx";

/** Renders sanitised CMS HTML (allow-listed at import / admin save time). */
export function Html({ html, className }: { html: string; className?: string }) {
  const safe = html.replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, "</table></div>");
  return <div className={clsx("prose-resort", className)} dangerouslySetInnerHTML={{ __html: safe }} />;
}
