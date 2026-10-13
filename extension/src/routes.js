const NeoRoutes = (() => {
  const ORIGIN = 'https://myetl.snu.ac.kr';
  const SECTIONS = ['overview', 'assignments', 'announcements', 'files', 'modules', 'grades', 'syllabus'];

  function parse(url) {
    let u;
    try {
      u = new URL(url);
    } catch {
      return null;
    }
    if (u.origin !== ORIGIN || u.searchParams.get('neo') === 'classic') return null;
    const path = u.pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return { view: 'today' };
    if (/^\/courses\/\d+\/assignments\/syllabus$/.test(path)) {
      return { view: 'course', courseId: path.split('/')[2], section: 'syllabus' };
    }
    const match = path.match(/^\/courses\/(\d+)(?:\/(assignments|announcements|files|modules|grades))?$/);
    if (!match) return null;
    const tool = u.searchParams.get('neo-tool');
    if (!match[2] && /^\d+$/.test(tool ?? '')) return { view: 'course', courseId: match[1], section: 'tool', toolId: tool };
    return { view: 'course', courseId: match[1], section: match[2] || 'overview' };
  }

  function path(route) {
    if (route.view === 'today') return '/';
    const base = `/courses/${route.courseId}`;
    if (route.section === 'tool') return `${base}?neo-tool=${route.toolId}`;
    if (route.section === 'syllabus') return `${base}/assignments/syllabus`;
    return route.section && route.section !== 'overview' ? `${base}/${route.section}` : base;
  }

  function classicUrl(url) {
    const u = new URL(url);
    const tool = u.searchParams.get('neo-tool');
    const course = /^\/courses\/(\d+)\/?$/.exec(u.pathname)?.[1];
    if (course && /^\d+$/.test(tool ?? '')) return `${ORIGIN}/courses/${course}/external_tools/${tool}`;
    u.hash = '';
    u.searchParams.delete('neo-tool');
    u.searchParams.set('neo', 'classic');
    return u.href;
  }

  return { ORIGIN, SECTIONS, parse, path, classicUrl };
})();

if (typeof module === 'object') module.exports = NeoRoutes;
