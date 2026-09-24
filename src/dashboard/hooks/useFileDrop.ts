import { useEffect, useRef, useState } from 'react';

/** Files from a drop, skipping any folders dragged in (which can't be read as a file). */
function filesFromDrop(dataTransfer: DataTransfer): File[] {
  const fromItems: File[] = [];
  for (const item of Array.from(dataTransfer.items ?? [])) {
    if (item.kind !== 'file') continue;
    if (item.webkitGetAsEntry?.()?.isFile === false) continue;
    const file = item.getAsFile();
    if (file) fromItems.push(file);
  }
  return fromItems.length > 0 ? fromItems : Array.from(dataTransfer.files);
}

// Drags of things inside the page itself (e.g. reordering courses) carry no 'Files' type.
function isDraggingFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

/**
 * Lets files from outside the browser be dropped anywhere on the window — including
 * the empty margins around the content, which also stops the browser from navigating
 * away to open a file dropped where nothing handled it. Returns whether files are
 * being dragged over the window right now, for showing a drop overlay.
 *
 * While `disabled` (say, a dialog is already open) a drop is swallowed and ignored.
 */
export function useFileDrop(onFiles: (files: File[]) => void, disabled = false): boolean {
  const [dragging, setDragging] = useState(false);
  // dragenter/dragleave also fire for every child element crossed, so a plain
  // boolean would flicker off mid-drag; counting enters minus leaves doesn't.
  const dragDepth = useRef(0);
  // The window listeners below are set up once, so they read the latest values from here.
  const latest = useRef({ onFiles, disabled });
  latest.current = { onFiles, disabled };

  useEffect(() => {
    function onDragEnter(e: DragEvent) {
      if (!isDraggingFiles(e)) return;
      e.preventDefault();
      dragDepth.current++;
      setDragging(true);
    }

    function onDragOver(e: DragEvent) {
      if (!isDraggingFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }

    function onDragLeave(e: DragEvent) {
      if (!isDraggingFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    }

    function onDrop(e: DragEvent) {
      if (!isDraggingFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (latest.current.disabled || !e.dataTransfer) return;
      const dropped = filesFromDrop(e.dataTransfer);
      if (dropped.length > 0) latest.current.onFiles(dropped);
    }

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  return dragging;
}
