/** Splits off the extension: ".pdf" from "notes.pdf", none from "README" or ".bashrc".
 *  A long run after the last dot ("Tema_1.Introduccion_y_conceptos") isn't one. */
export function splitExtension(name: string): [base: string, extension: string] {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || name.length - dot > 8) return [name, ''];
  return [name.slice(0, dot), name.slice(dot)];
}

/**
 * A filename on one line that, when it doesn't fit, is cut off with "…" just before
 * its extension rather than at the end — so the extension is always visible. The full name is in the tooltip.
 */
export function FileName({ name, className }: { name: string; className?: string }) {
  const [base, extension] = splitExtension(name);
  return (
    <span className={`file-name${className ? ` ${className}` : ''}`} title={name}>
      <span className="file-name-base">{base}</span>
      {extension && <span className="file-name-ext">{extension}</span>}
    </span>
  );
}
