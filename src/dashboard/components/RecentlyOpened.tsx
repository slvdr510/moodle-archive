import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { recentOpenStore } from '../../lib/db';
import { applyRecentSettings } from '../../lib/recentSettings';
import type { FileRecord, RecentOpenRecord } from '../../types';
import { useFileOpener } from '../hooks/useFileOpener';
import { useRecentSettings } from '../hooks/useRecentSettings';
import { FileName } from './FileName';
import { VersionPickerModal } from './VersionPickerModal';
import { useT } from '../hooks/useTranslation';

/** How far the "+N" button's hover area reaches past the button, above and below —
 *  matches the CSS's --more-hover-margin. */
const MORE_HOVER_MARGIN = 4;

function RecentFileItem({
  record,
  file,
  onChange
}: {
  record: RecentOpenRecord;
  file: FileRecord;
  onChange: () => void;
}) {
  const t = useT();
  const { handleClick, showPicker, closePicker, selectVersion, deleteVersion, versions } = useFileOpener(file, onChange);

  return (
    <>
      {/* The whole pill opens the file, not just its text. The inner button stays for
          keyboard/screen-reader access — its clicks bubble up to this handler. */}
      <div className="recent-file-item" onClick={handleClick}>
        <button className="recent-file-open">
          <FileName name={file.filename} />
        </button>
        <button
          className="recent-file-remove"
          title={t.recentlyOpened.remove}
          onClick={(e) => {
            e.stopPropagation();
            void recentOpenStore.remove(record.id).then(onChange);
          }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Portaled out, so it stays visible when the item it was opened from is in the
          "show all" panel, which hides again once the pointer leaves it. */}
      {showPicker &&
        versions &&
        createPortal(
          <VersionPickerModal versions={versions} onSelect={selectVersion} onDelete={deleteVersion} onClose={closePicker} />,
          document.body
        )}
    </>
  );
}

export function RecentlyOpened({
  records,
  filesById,
  onChange
}: {
  records: RecentOpenRecord[];
  filesById: Map<string, FileRecord>;
  onChange: () => void;
}) {
  const t = useT();
  const [settings] = useRecentSettings();
  const items = applyRecentSettings(
    records
      .map((record) => ({ record, file: filesById.get(record.fileId) }))
      .filter((x): x is { record: RecentOpenRecord; file: FileRecord } => x.file !== undefined),
    settings
  );

  // The list shows a single row (see .recently-opened-list); how many items didn't fit
  // on it, to offer them all from the button at its end.
  const listRef = useRef<HTMLDivElement>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  // One item's height: the row's, and the "+N" button's too, so it matches them exactly.
  const [itemHeight, setItemHeight] = useState<number | undefined>(undefined);
  // Where the last item that fits on the row ends: the "+N" button takes the rest of
  // the row from there, so the whole of it keeps the panel open.
  const [lastItemEnd, setLastItemEnd] = useState(0);
  // Whether the "show all" panel is open: from the pointer (or focus) entering the
  // button's area until it really leaves — not CSS :hover, which can drop when an
  // item removed from under the pointer reshuffles the panel.
  const [panelOpen, setPanelOpen] = useState(false);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    function measure() {
      const children = Array.from(list!.children) as HTMLElement[];
      if (children.length === 0) return;
      // One item's height is the row's: anything past it is cut off.
      list!.style.maxHeight = `${children[0].offsetHeight}px`;
      setItemHeight(children[0].offsetHeight);
      const firstRowTop = children[0].offsetTop;
      const onRow = children.filter((child) => child.offsetTop === firstRowTop);
      const last = onRow[onRow.length - 1];
      setLastItemEnd(last.offsetLeft - list!.offsetLeft + last.offsetWidth);
      setHiddenCount(children.length - onRow.length);
    }
    measure();
    // The items change width (and so how many fit) once the web font replaces the
    // fallback one, without the list itself resizing.
    void document.fonts?.ready.then(measure);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items.map(({ record }) => record.id).join('\n')]);

  if (items.length === 0) return null;

  const renderItems = (shown: typeof items) =>
    shown.map(({ record, file }) => <RecentFileItem key={record.id} record={record} file={file} onChange={onChange} />);

  const hasMore = hiddenCount > 0 || panelOpen;

  return (
    // While the "show all" panel is open, it lays over this whole section — title
    // included, in its very place — with every item; it closes once the pointer
    // (or focus) leaves the section.
    <section
      className={`recently-opened${panelOpen ? ' open' : ''}`}
      onMouseLeave={() => setPanelOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPanelOpen(false);
      }}
    >
      <h3>{t.recentlyOpened.title}</h3>
      <div className="recently-opened-row">
        <div className="recently-opened-list" ref={listRef}>
          {renderItems(items)}
        </div>
        {/* Kept while open even once nothing is left hidden (items removed from the
            panel), so it doesn't vanish from under the pointer. */}
        {hasMore && (
          // Entering the button's area (or focusing it) opens the panel. That area
          // starts right at the last item (the gap before the button is padding, see
          // .recently-opened-more), and reaches a little above and below the button.
          <div
            className="recently-opened-more"
            onMouseEnter={() => setPanelOpen(true)}
            onFocus={() => setPanelOpen(true)}
            style={{ insetInlineStart: lastItemEnd, height: itemHeight === undefined ? undefined : itemHeight + 2 * MORE_HOVER_MARGIN }}
          >
            <button
              className="recently-opened-more-button"
              title={t.recentlyOpened.showAll}
              aria-label={t.recentlyOpened.showAll}
            >
              +{hiddenCount}
            </button>
          </div>
        )}
      </div>
      {/* Always mounted once there's a "+N" (just hidden while closed), so a version
          picker opened from one of its items isn't unmounted when it closes. */}
      {hasMore && (
        <div className="recently-opened-panel">
          <h3>{t.recentlyOpened.title}</h3>
          <div className="recently-opened-panel-items">{renderItems(items)}</div>
        </div>
      )}
    </section>
  );
}
