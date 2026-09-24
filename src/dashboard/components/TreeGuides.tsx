/** Horizontal room each nesting level takes, and the row's base left padding. Shared
 *  by FileRow/FolderRow (text indent) and the CSS that draws the guides (.tree-guide). */
export const TREE_INDENT_PX = 20;
export const rowPaddingLeft = (depth: number) => 16 + depth * TREE_INDENT_PX;

/**
 * The connector lines in the left gutter of a nested row, like a file explorer's
 * tree: one column per ancestor level, and in the last column an elbow (├ or └)
 * joining the row to its parent's line.
 *
 * `guides[k]` says whether the line of ancestor level `k` keeps going below this row
 * (i.e. that ancestor still has later siblings); `isLast` says whether this row is
 * the last child of its parent, which closes the line with a rounded └.
 */
export function TreeGuides({ depth, guides, isLast }: { depth: number; guides: boolean[]; isLast: boolean }) {
  if (depth === 0) return null;
  return (
    <span className="tree-guides" aria-hidden="true">
      {Array.from({ length: depth - 1 }, (_, level) => (
        <i key={level} className={`tree-guide${guides[level] ? ' through' : ''}`} />
      ))}
      <i className={`tree-guide elbow${isLast ? ' last' : ''}`} />
    </span>
  );
}
