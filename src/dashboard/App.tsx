import { useEffect, useState } from 'react';
import { DateFormatSelector } from './components/DateFormatSelector';
import { ThemeSelector } from './components/ThemeSelector';
import { CoursesPage } from './pages/CoursesPage';
import { CourseFilesPage } from './pages/CourseFilesPage';

type View =
  | { name: 'courses' }
  | { name: 'course-files'; courseId: string; courseName: string; courseUrl?: string };

function viewFromHistoryState(state: unknown): View {
  if (state && typeof state === 'object' && (state as { name?: string }).name === 'course-files') {
    const s = state as { name: 'course-files'; courseId: string; courseName: string; courseUrl?: string };
    return { name: 'course-files', courseId: s.courseId, courseName: s.courseName, courseUrl: s.courseUrl };
  }
  return { name: 'courses' };
}

export function App() {
  const [view, setView] = useState<View>(() => viewFromHistoryState(history.state));
  // The courses list's "⋮" overflow menu is rendered here, in the header, so
  // it sits next to the theme selector — but CoursesPage owns the state those
  // menu items act on, so it portals the menu into this slot instead of us
  // lifting all of that state up. The slot only exists while the courses view
  // is mounted, so the menu disappears on its own when navigating away.
  const [headerMenuSlot, setHeaderMenuSlot] = useState<HTMLDivElement | null>(null);

  // Pushing a history entry when opening a course means the browser's own
  // back/forward — including mouse side buttons — navigates between the two
  // views instead of leaving the dashboard page (there's nothing behind it
  // in a freshly opened extension tab otherwise).
  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      setView(viewFromHistoryState(e.state));
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function openCourse(courseId: string, courseName: string, courseUrl: string | undefined) {
    const nextView: View = { name: 'course-files', courseId, courseName, courseUrl };
    history.pushState(nextView, '');
    setView(nextView);
  }

  function backToCourses() {
    // Only step back through history if we actually pushed the entry we're
    // currently on — otherwise (e.g. this is the very first history entry)
    // just switch views directly rather than navigating away from the page.
    if (history.state && (history.state as { name?: string }).name === 'course-files') {
      history.back();
    } else {
      setView({ name: 'courses' });
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-title">
          <span className="app-logo" aria-hidden="true">
            🎓
          </span>
          <h1 onClick={backToCourses}>Moodle Archive</h1>
          <a
            className="app-credit"
            href="https://github.com/slvdr510/moodle-archive"
            target="_blank"
            rel="noopener noreferrer"
          >
            by slvdr510
          </a>
        </div>
        <div className="app-header-actions">
          <DateFormatSelector />
          <ThemeSelector />
          {view.name === 'courses' && <div ref={setHeaderMenuSlot} />}
        </div>
      </header>
      <main>
        {view.name === 'courses' ? (
          <CoursesPage headerMenuSlot={headerMenuSlot} onOpenCourse={openCourse} />
        ) : (
          <CourseFilesPage
            courseId={view.courseId}
            courseName={view.courseName}
            courseUrl={view.courseUrl}
            onBack={backToCourses}
          />
        )}
      </main>
    </div>
  );
}
