const NeoApp = (() => {
  const { t, h, icon, formatMd, formatMdTime, formatMonth, relative, formatDay, formatShortDate, formatDateTime } = NeoUI;

  const SECTION_LABELS = {
    overview: 'sectionOverview',
    assignments: 'sectionAssignments',
    announcements: 'sectionAnnouncements',
    files: 'sectionFiles',
    modules: 'sectionModules',
    grades: 'sectionGrades',
    syllabus: 'sectionSyllabus',
  };

  const MODULE_ICONS = { File: 'file', Page: 'doc', Assignment: 'assignment', Quiz: 'quiz', Discussion: 'chat', ExternalUrl: 'external', ExternalTool: 'play' };

  const LOOK_KEYS = ['theme', 'customTheme', 'cardPalette', 'cardStyle', 'font', 'wallpaper', 'wallpaperImage', 'covers', 'condensed', 'showTodo', 'customCss', 'tabIcons'];

  const IMAGE_MAX_CHARS = 1_800_000;
  const DAY_MS = 24 * 60 * 60 * 1000;

  function mount(doc, { api, settings: initialSettings }) {
    let settings = initialSettings;
    const store = NeoData.createStore(api);
    const host = doc.createElement('div');
    host.id = 'neo-app-root';
    const shadow = host.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(NEO_APP_CSS);
    const userSheet = new CSSStyleSheet();
    shadow.adoptedStyleSheets = [sheet, userSheet];

    const pagesNav = h('nav', { 'aria-label': t('pages') });
    const nav = h('nav', { 'aria-label': t('courses') });
    const avatar = h('a', { class: 'avatar', href: `${NeoRoutes.ORIGIN}/profile/settings`, title: t('profile'), 'aria-label': t('profile') });
    const classicLink = h('a', { class: 'foot-button', title: t('classicView'), 'aria-label': t('classicView') }, t('classicView'));
    const sidebar = h(
      'aside',
      { class: 'sidebar' },
      h('div', { class: 'side-top' }, h('span', { class: 'emblem', role: 'img', 'aria-label': t('snu') })),
      h('div', { class: 'sidebar-label' }, t('pages')),
      pagesNav,
      h('div', { class: 'sidebar-label' }, t('courses')),
      nav,
      h(
        'div',
        { class: 'sidebar-foot' },
        avatar,
        h('button', { class: 'brand-button', title: t('customise'), 'aria-label': t('customise'), dataset: { widget: 'themes' }, onclick: () => openThemes() }, icon('palette')),
        classicLink,
      ),
    );
    const topbarTitle = h('span');
    const page = h('div', { class: 'page' });
    const content = h(
      'main',
      { class: 'content' },
      h('div', { class: 'topbar' }, h('button', { class: 'tool', 'aria-label': t('menu'), onclick: () => app.classList.toggle('menu-open') }, icon('sidebar')), topbarTitle),
      page,
    );
    const app = h('div', { class: 'app' }, sidebar, content);
    shadow.append(app);
    doc.body.prepend(host);
    host.style.setProperty('--emblem', `url("${chrome.runtime.getURL('icons/snu-logo.png')}")`);

    let route = null;
    let renderToken = 0;
    let courseList = [];
    let theme = null;
    let cleanups = [];
    const tracker = { period: 'week', offset: 0, course: 'all', tab: 'due' };

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value ?? ''));

    function applyTheme() {
      theme = NeoThemes.resolve(settings.theme, darkQuery.matches, settings.customTheme);
      const vars = {
        '--bg': theme.bg,
        '--surface': theme.surface,
        '--fill': theme.fill,
        '--border': theme.border,
        '--text': theme.text,
        '--text2': theme.text2,
        '--accent': theme.accent,
        '--on-accent': theme.onAccent,
        '--date': theme.date,
        '--danger': theme.danger,
        '--warn': theme.warn,
        '--sidebar': theme.sidebar,
        '--sidebar-text': theme.sidebarText,
        '--sidebar-active': theme.sidebarActive,
        '--sidebar-active-text': theme.sidebarActiveText ?? (isHex(theme.sidebarActive) ? NeoThemes.textOn(theme.sidebarActive) : theme.sidebarText),
        '--title': theme.title ?? theme.text,
        '--font': NeoThemes.fontStack(settings.font, theme),
        '--font-title': NeoThemes.fontStack(settings.font, theme, { headings: true }),
        '--font-ko': NeoThemes.fontStack(settings.font, theme, { korean: true }),
        '--wallpaper': wallpaperCss(),
      };
      for (const [name, value] of Object.entries(vars)) host.style.setProperty(name, value);
      host.toggleAttribute('data-glass', Boolean(theme.glass) || (settings.wallpaper === 'image' && Boolean(settings.wallpaperImage)));
      host.dataset.mode = theme.mode;
      host.toggleAttribute('data-personal-font', NeoThemes.fontStack(settings.font, theme) === NeoThemes.FONTS.personal);
      try {
        userSheet.replaceSync(settings.customCss || '');
      } catch {
        userSheet.replaceSync('');
      }
      doc.documentElement.style.setProperty('--neo-bg', theme.bg);
    }

    function wallpaperCss() {
      if (settings.wallpaper === 'none') return 'none';
      if (settings.wallpaper === 'image' && /^data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+$/.test(settings.wallpaperImage)) {
        const dim = theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.18)';
        return `linear-gradient(${dim}, ${dim}), url("${settings.wallpaperImage}") center / cover no-repeat`;
      }
      return theme.wallpaper ?? 'none';
    }

    const onSchemeChange = () => {
      if (settings.theme !== 'auto') return;
      applyTheme();
      refreshView();
    };
    darkQuery.addEventListener('change', onSchemeChange);

    function courseIndex(courseId) {
      return Math.max(0, courseList.findIndex((c) => c.id === String(courseId)));
    }

    function colorOf(courseId) {
      const course = courseList.find((c) => c.id === String(courseId)) ?? { id: String(courseId) };
      return NeoThemes.courseColor(course, courseIndex(courseId), theme, settings.cardPalette);
    }

    const coverOf = (courseId) => {
      const cover = settings.covers?.[courseId];
      return /^data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+$/.test(cover ?? '') ? cover : null;
    };

    function paint(el, courseId, { background = false } = {}) {
      const color = colorOf(courseId);
      el.style.setProperty('--c', color);
      el.style.setProperty('--c-name', NeoThemes.inkFor(color, theme));
      if (background) {
        const cover = coverOf(courseId);
        el.style.setProperty('--card-bg', cover ? `url("${cover}") center / cover no-repeat` : NeoThemes.cardBackground(color, settings.cardStyle, courseIndex(courseId)));
      }
      return el;
    }

    const mini = (courseId) => paint(h('span', { class: 'mini' }), courseId);
    const courseName = (courseId) => courseList.find((c) => c.id === String(courseId))?.name ?? '';
    const initial = (name) => [...String(name ?? '').trim()][0] ?? '·';

    async function loadCourses() {
      courseList = await store.courses();
      return courseList;
    }

    const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

    app.addEventListener('click', (event) => {
      if (!event.target.closest('.menu, .kebab, .card-menu-btn')) closeMenus();
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || !plainClick(event) || link.target === '_blank' || link.hasAttribute('download')) return;
      if (!NeoRoutes.parse(link.href)) return;
      event.preventDefault();
      if (link.href !== location.href) history.pushState(null, '', link.href);
      render({ scroll: true });
    });

    const onPopState = () => render({ scroll: false });
    window.addEventListener('popstate', onPopState);

    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeMenus();
        closeOverlay();
      }
    };
    doc.addEventListener('keydown', onKey);

    const isCurrent = (r) => Boolean(r) && r.view === route.view && r.courseId === route.courseId;
    const navHref = (r) => new URL(NeoRoutes.path(r), NeoRoutes.ORIGIN).href;
    const errorKey = (error) => (error?.unauthenticated ? 'notLoggedIn' : 'loadFailed');
    const refusedKey = (error, key) => (!error?.unauthenticated && [401, 403, 404].includes(error?.status) ? key : errorKey(error));
    const dateSpan = (text) => (text ? h('span', { class: 'date' }, text) : null);
    const loading = () => h('p', { class: 'loading' }, t('loading'));
    const failed = (key = 'loadFailed') => h('p', { class: 'error' }, t(key));
    const empty = (key) => h('p', { class: 'empty' }, t(key));
    const percent = (value) => `${Math.round(value * 10) / 10}%`;

    function set(el, ...children) {
      el.replaceChildren(...children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false));
    }

    function metaLine(...parts) {
      const nodes = [];
      for (const part of parts.flat()) {
        if (part === null || part === undefined || part === '' || part === false) continue;
        if (nodes.length > 0) nodes.push(h('span', { 'aria-hidden': 'true' }, '·'));
        nodes.push(part instanceof Node ? part : h('span', null, part));
      }
      return nodes.length ? h('span', { class: 'meta' }, nodes) : null;
    }

    function section(title, children, { count = null, aside = null, late = false, bare = false } = {}) {
      return h(
        'section',
        { class: 'section' },
        h('h2', { class: late ? 'section-title late' : 'section-title' }, title, count === null ? null : h('span', { class: 'count' }, count), aside ? h('span', { class: 'aside' }, aside) : null),
        bare ? children : h('div', { class: 'panel' }, children),
      );
    }

    function row({ lead = null, href = null, title, prefix = null, meta = null, trail = null, done = false }) {
      const main = h(
        href ? 'a' : 'div',
        {
          class: 'main',
          href,
        },
        h('span', { class: 'title', lang: proseLanguage(title || '') }, prefix, title || t('untitled')),
        meta,
      );
      return h(
        'li',
        { class: done ? 'done' : null },
        h('div', { class: lead === null ? 'row no-lead' : 'row' }, lead === null ? null : h('span', { class: 'lead' }, lead), main, h('span', { class: 'trail' }, trail)),
      );
    }

    const pill = (text, kind = '') => h('span', { class: `pill ${kind}`.trim() }, text);

    const proseLanguage = (text) => /[\uac00-\ud7a3]/u.test(text) ? 'ko' : 'en';

    function viewTitle(title) {
      doc.title = `${title} · eTL`;
      topbarTitle.textContent = title;
      setTabIcon();
    }

    function save(patch) {
      const before = settings;
      settings = { ...settings, ...patch };
      return NeoSettings.save(patch).then(
        () => true,
        () => {
          settings = before;
          return false;
        },
      );
    }

    function toast(message) {
      const note = h('div', { class: 'toast', role: 'status' }, message);
      shadow.append(note);
      setTimeout(() => note.remove(), 4000);
    }

    const onToolView = () => route?.view === 'course' && route.section === 'tool';
    let needsRender = false;

    function refreshView() {
      if (onToolView()) return;
      if (overlay) {
        needsRender = true;
        return;
      }
      render({ scroll: false });
    }

    let openMenu = null;

    function closeMenus() {
      openMenu?.remove();
      openMenu = null;
    }

    function menuButton(items, { className = 'kebab', label = t('more') } = {}) {
      const wrap = h('span', { class: 'menu-wrap' });
      const button = h('button', { class: className, title: label, 'aria-label': label, 'aria-haspopup': 'true' }, icon('more'));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const wasOpen = openMenu && openMenu.parentElement === wrap.parentElement;
        closeMenus();
        if (wasOpen) return;
        openMenu = h(
          'div',
          { class: 'menu', role: 'menu' },
          items
            .filter(Boolean)
            .map((item) =>
              item.href
                ? h('a', { href: item.href, role: 'menuitem' }, icon(item.icon), item.label)
                : h('button', { role: 'menuitem', onclick: () => (closeMenus(), item.onClick()) }, icon(item.icon), item.label),
            ),
        );
        wrap.parentElement.append(openMenu);
      });
      wrap.append(button);
      return wrap;
    }

    function pageHead(title, sub, menuItems) {
      return h(
        'header',
        { class: 'page-head' },
        h('div', null, h('h1', null, title), sub ? h('p', { class: 'head-sub' }, sub) : null),
        h('div', { class: 'head-tools' }, menuButton(menuItems)),
      );
    }

    const refreshItem = () => ({
      icon: 'refresh',
      label: t('refresh'),
      onClick: () => {
        store.clear();
        render({ scroll: false });
      },
    });

    const originalIcons = [...doc.querySelectorAll('link[rel~="icon"]')];
    let tabIcon = null;

    function setTabIcon() {
      if (!settings.tabIcons || !route) {
        restoreTabIcon();
        return;
      }
      for (const link of originalIcons) link.rel = 'neo-original-icon';
      if (!tabIcon) {
        tabIcon = doc.createElement('link');
        tabIcon.rel = 'icon';
        tabIcon.type = 'image/png';
        tabIcon.href = chrome.runtime.getURL('icons/snu-black-64.png');
        doc.head?.append(tabIcon);
      }
    }

    function restoreTabIcon() {
      tabIcon?.remove();
      tabIcon = null;
      for (const link of originalIcons) link.rel = 'icon';
    }

    let overlay = null;
    let overlayCleanup = null;

    function closeOverlay() {
      if (!overlay) return;
      overlayCleanup?.();
      overlayCleanup = null;
      overlay.remove();
      overlay = null;
      if (needsRender) {
        needsRender = false;
        refreshView();
      }
    }

    function openSheet(title, body) {
      closeOverlay();
      const panel = h(
        'div',
        { class: 'sheet', role: 'dialog', 'aria-label': title },
        h('div', { class: 'sheet-head' }, h('h2', null, title), h('button', { class: 'tool', 'aria-label': t('close'), onclick: closeOverlay }, icon('close'))),
        body,
      );
      overlay = h('div', { class: 'sheet-backdrop', onclick: (e) => e.target === overlay && closeOverlay() }, panel);
      shadow.append(overlay);
      return panel;
    }

    async function pickImage(maxSide) {
      const input = h('input', { type: 'file', accept: 'image/png, image/jpeg, image/webp, image/gif' });
      const file = await new Promise((resolve) => {
        input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
        input.addEventListener('cancel', () => resolve(null), { once: true });
        input.click();
      });
      if (!file) return null;
      let bitmap;
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        toast(t('pictureUnreadable'));
        return null;
      }
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = doc.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.75, 0.6, 0.45]) {
        const url = canvas.toDataURL('image/jpeg', quality);
        if (url.length <= IMAGE_MAX_CHARS) return url;
      }
      toast(t('pictureTooBig'));
      return null;
    }

    async function changeCover(courseId) {
      const url = await pickImage(1200);
      if (!url) return;
      if (!(await save({ covers: { ...(settings.covers ?? {}), [courseId]: url } }))) toast(t('pictureNotSaved'));
      refreshView();
    }

    async function removeCover(courseId) {
      const covers = { ...(settings.covers ?? {}) };
      delete covers[courseId];
      await save({ covers });
      refreshView();
    }

    const coverItems = (courseId) => [
      { icon: 'image', label: t('changeCover'), onClick: () => changeCover(courseId) },
      coverOf(courseId) ? { icon: 'close', label: t('removeCover'), onClick: () => removeCover(courseId) } : null,
    ];

    function renderPages() {
      const homeRoute = { view: 'today' };
      const pageItem = (iconName, label, props, ...extra) => h(props.href ? 'a' : 'button', { class: 'item', ...props }, icon(iconName), h('span', { class: 'name' }, label), ...extra);
      set(
        pagesNav,
        pageItem('home', t('dashboard'), { href: navHref(homeRoute), 'aria-current': isCurrent(homeRoute) ? 'page' : null }),
        pageItem('layers', t('allCoursesPage'), { href: `${NeoRoutes.ORIGIN}/courses` }, icon('external', 'icon chev')),
        pageItem('calendar', t('calendarPage'), { href: `${NeoRoutes.ORIGIN}/calendar` }, icon('external', 'icon chev')),
        pageItem('inbox', t('inbox'), { href: `${NeoRoutes.ORIGIN}/conversations` }, icon('external', 'icon chev')),
      );
    }

    function renderAvatar() {
      store
        .me()
        .then((me) => {
          if (me.name) avatar.title = me.name;
          set(avatar, me.avatar ? h('img', { src: me.avatar, alt: '' }) : me.initials);
        })
        .catch(() => {});
    }

    async function renderSidebar(token) {
      set(nav, loading());
      try {
        const courses = await loadCourses();
        if (token !== renderToken) return;
        set(
          nav,
          courses.map((course) => {
            const r = { view: 'course', courseId: course.id };
            return h(
              'a',
              { class: 'item', href: navHref(r), 'aria-current': isCurrent(r) ? 'page' : null, title: course.fullName || course.name },
              paint(h('span', { class: 'dot' }), course.id),
              h('span', { class: 'name' }, course.name),
              icon('chev', 'icon chev'),
            );
          }),
        );
      } catch (error) {
        if (token === renderToken) set(nav, failed(errorKey(error)));
      }
    }

    const isChecked = (item) => Boolean(settings.checked?.[item.id]);
    const isDone = (item) => item.done || isChecked(item);

    const isUnread = (item) => item.unread && !settings.readAnnouncements?.[item.id];

    function markRead(item) {
      if (!item.unread || !item.courseId) return;
      store
        .markRead(item.courseId, item.id)
        .then(() => {
          item.unread = false;
          const ids = Object.keys(settings.readAnnouncements ?? {}).slice(-499);
          save({ readAnnouncements: Object.fromEntries([...ids, item.id].map((id) => [id, true])) });
        })
        .catch(() => {});
    }

    function checkButton(item, onChange, className = 'check') {
      const button = h('button', { class: className, 'aria-pressed': String(isDone(item)), title: t('markDone'), 'aria-label': t('markDone') }, icon('check'));
      if (item.done) button.disabled = true;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const checked = { ...(settings.checked ?? {}) };
        if (checked[item.id]) delete checked[item.id];
        else checked[item.id] = true;
        save({ checked });
        button.setAttribute('aria-pressed', String(Boolean(checked[item.id])));
        onChange?.(Boolean(checked[item.id]));
      });
      return button;
    }

    function announcementHref(item) {
      return item.courseId ? navHref({ view: 'course', courseId: item.courseId, section: 'announcements' }) + `#a-${item.id}` : item.url;
    }

    function announcementRow(item, { showCourse }) {
      return row({
        href: announcementHref(item),
        title: item.title,
        prefix: isUnread(item) ? h('span', { class: 'unread-dot', title: t('unread') }) : null,
        meta: metaLine(showCourse && item.course ? h('span', null, mini(item.courseId), ' ', item.course) : null, dateSpan(formatShortDate(item.postedAt))),
      });
    }

    function dueRow(item) {
      const done = isDone(item);
      const row = paint(h('div', { class: `due-row ${done ? 'done' : item.missing ? 'late' : ''}`.trim() }), item.courseId);
      const label = item.title || t('untitled');
      const title = item.url
        ? h('a', { class: 't', href: item.url, title: label }, label)
        : h('span', { class: 't', title: label }, label);
      row.append(checkButton(item, (on) => row.classList.toggle('done', on || item.done), 'check small'), title, h('span', { class: 'd' }, item.due ? formatMd(item.due) : ''));
      return row;
    }

    function courseCard(course, data) {
      const link = (sectionName) => navHref({ view: 'course', courseId: course.id, section: sectionName });
      const mine = (item) => item.courseId === course.id;
      const due = [...data.overdue.items.filter(mine), ...data.upcoming.items.filter(mine)].slice(0, 4);
      const card = paint(h('div', { class: 'card', dataset: { course: course.id } }), course.id, { background: true });
      const shortcut = (sectionName, iconName, key) => h('a', { href: link(sectionName), title: t(key), 'aria-label': t(key) }, icon(iconName));
      card.append(
        h(
          'div',
          { class: 'card-hero' },
          h('a', { class: 'cover-link', href: link('overview'), title: course.fullName || course.name, 'aria-label': course.name }),
          menuButton([...coverItems(course.id), { icon: 'external', label: t('openCourse'), href: link('overview') }], { className: 'card-menu-btn', label: t('cardOptions') }),
        ),
        h(
          'div',
          { class: 'card-body' },
          h('a', { class: 'card-name', href: link('overview'), title: course.name }, course.name),
          h('span', { class: 'card-code' }, [course.code, course.section ? t('sectionNumber', [course.section]) : null].filter(Boolean).join(' · ')),
          h(
            'nav',
            { class: 'card-icons' },
            shortcut('announcements', 'megaphone', 'sectionAnnouncements'),
            shortcut('assignments', 'assignment', 'sectionAssignments'),
            shortcut('modules', 'layers', 'sectionModules'),
            shortcut('files', 'folder', 'sectionFiles'),
          ),
          h('div', { class: 'card-due' }, h('h3', null, t('due')), due.length === 0 ? h('p', { class: 'due-none' }, t('nothingDueShort')) : due.map(dueRow)),
        ),
      );
      return card;
    }

    function periodRange(period, offset, now = new Date()) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (period === 'day') {
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1) };
      }
      if (period === 'month') {
        const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
        return { start, end: new Date(start.getFullYear(), start.getMonth() + 1, 1) };
      }
      const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
      return { start: monday, end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7) };
    }

    function rangeLabel(period, { start, end }) {
      if (period === 'day') return formatDay(start.toISOString());
      if (period === 'month') return formatMonth(start.toISOString());
      return `${formatShortDate(start.toISOString())} – ${formatShortDate(new Date(end.getTime() - DAY_MS).toISOString())}`;
    }

    function rings(rows) {
      const NS = 'http://www.w3.org/2000/svg';
      const svg = doc.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 220 220');
      const shown = rows.slice(0, 6);
      const step = 14;
      shown.forEach((r, i) => {
        const radius = 100 - i * step;
        const length = 2 * Math.PI * radius;
        const ratio = r.total > 0 ? r.done / r.total : 0;
        const track = doc.createElementNS(NS, 'circle');
        const arc = doc.createElementNS(NS, 'circle');
        for (const c of [track, arc]) {
          c.setAttribute('cx', '110');
          c.setAttribute('cy', '110');
          c.setAttribute('r', String(radius));
          c.setAttribute('fill', 'none');
          c.setAttribute('stroke-width', '10');
          c.setAttribute('stroke-linecap', 'round');
        }
        track.setAttribute('stroke', r.color);
        track.setAttribute('stroke-opacity', '0.25');
        arc.setAttribute('stroke', r.color);
        arc.setAttribute('stroke-dasharray', `${Math.max(ratio * length, ratio > 0 ? 1 : 0)} ${length}`);
        arc.setAttribute('transform', 'rotate(-90 110 110)');
        const title = doc.createElementNS(NS, 'title');
        title.textContent = `${r.name}: ${r.done}/${r.total}`;
        arc.append(title);
        svg.append(track, arc);
      });
      return svg;
    }

    function trackItem(item, now, onToggle = null) {
      const done = isDone(item);
      const dueMs = Date.parse(item.due);
      const urgent = !done && dueMs >= now.getTime() && dueMs - now.getTime() < DAY_MS;
      const late = !done && item.missing;
      const el = paint(h('div', { class: done ? 'track-item done' : 'track-item' }), item.courseId);
      const soon = !done && item.due && Math.abs(dueMs - now.getTime()) < 2 * DAY_MS;
      el.append(
        h(
          item.url ? 'a' : 'div',
          {
            class: 'ti-main',
            href: item.url,
          },
          h('span', { class: 'ti-course' }, item.course || courseName(item.courseId)),
          h('span', { class: 'ti-title' }, item.title || t('untitled')),
          h(
            'span',
            { class: 'ti-due' },
            h('span', { class: urgent ? 'urgent' : late ? 'late' : null }, item.due ? t('dueAt', [formatMdTime(item.due)]) + (soon ? ` · ${relative(item.due, now)}` : '') : t('noDueDate')),
            item.points !== null && item.points !== undefined ? h('span', { class: 'pts' }, t('points', [String(item.points)])) : null,
          ),
        ),
        checkButton(item, (on) => {
          el.classList.toggle('done', on || item.done);
          onToggle?.(on);
        }),
      );
      return el;
    }

    function group(title, items, now, { open = true, late = false, onToggle = null } = {}) {
      const details = h(
        'details',
        { class: late ? 'group late' : 'group' },
        h('summary', null, h('span', { class: 'count' }, String(items.length)), h('span', { class: 'label' }, title), icon('chevDown')),
        h('div', { class: 'group-items' }, items.map((item) => trackItem(item, now, onToggle))),
      );
      details.open = open && items.length > 0;
      return details;
    }

    const noTasks = () => h('div', { class: 'no-tasks' }, h('span', { class: 'count' }, '0'), t('noTasks'));

    async function renderTracker(box, data, token) {
      const now = new Date();
      const range = periodRange(tracker.period, tracker.offset, now);
      const rerender = () => renderTracker(box, data, token);
      const period = h('select', { class: 'period', 'aria-label': t('period') }, [['day', 'periodDay'], ['week', 'periodWeek'], ['month', 'periodMonth']].map(([value, key]) => h('option', { value }, t(key))));
      period.value = tracker.period;
      period.addEventListener('change', () => ((tracker.period = period.value), (tracker.offset = 0), rerender()));
      const tabButton = (tab, iconName, key) =>
        h('button', { 'aria-pressed': String(tracker.tab === tab), title: t(key), 'aria-label': t(key), dataset: { tab }, onclick: () => ((tracker.tab = tab), rerender()) }, icon(iconName));
      const ringsBox = h('div', { class: 'rings' }, loading());
      const legend = h('div', { class: 'legend', role: 'group', 'aria-label': t('courseFilter') });
      const body = h('div', { class: 'tracker-body' }, loading());
      set(
        box,
        h('div', { class: 'tracker-head' }, h('h2', null, t('todoList'))),
        h(
          'div',
          { class: 'range' },
          h('span', { class: 'period-wrap' }, period, icon('chevDown')),
          h('button', { class: 'arrow', 'aria-label': t('previous'), onclick: () => (tracker.offset--, rerender()) }, icon('arrowLeft')),
          h('span', { class: 'range-label' }, rangeLabel(tracker.period, range)),
          h('button', { class: 'arrow', 'aria-label': t('next'), onclick: () => (tracker.offset++, rerender()) }, icon('arrowRight')),
        ),
        ringsBox,
        legend,
        h('div', { class: 'seg tabs' }, tabButton('news', 'megaphone', 'tabNews'), tabButton('due', 'assignment', 'tabDue'), tabButton('done', 'check', 'tabDone')),
        body,
      );
      set(
        legend,
        courseList.map((c) =>
          h(
            'button',
            { 'aria-pressed': String(tracker.course === c.id), title: c.fullName || c.name, onclick: () => ((tracker.course = tracker.course === c.id ? 'all' : c.id), rerender()) },
            mini(c.id),
            h('span', null, c.name),
          ),
        ),
      );

      let items;
      try {
        items = await store.planner(range.start, range.end);
      } catch (error) {
        if (token === renderToken) set(body, failed(errorKey(error)));
        return;
      }
      if (token !== renderToken || !box.isConnected) return;
      const inScope = (item) => (tracker.course === 'all' || item.courseId === tracker.course) && item.type !== 'calendar_event';
      const includesNow = range.start.getTime() <= now.getTime() && now.getTime() < range.end.getTime();
      const scoped = items.filter(inScope);

      const drawRings = () => {
        const perCourse = courseList
          .filter((c) => tracker.course === 'all' || c.id === tracker.course)
          .map((c) => {
            const mine = scoped.filter((item) => item.courseId === c.id);
            return { name: c.name, color: colorOf(c.id), total: mine.length, done: mine.filter(isDone).length };
          })
          .filter((r) => r.total > 0);
        const total = scoped.length;
        const doneCount = scoped.filter(isDone).length;
        set(
          ringsBox,
          rings(perCourse.length > 0 ? perCourse : [{ name: '', color: theme.accent, total: 0, done: 0 }]),
          h('div', { class: 'center' }, h('b', null, total > 0 ? `${Math.round((doneCount / total) * 100)}%` : '—'), h('span', null, `${doneCount}/${total}`)),
        );
      };
      drawRings();

      if (tracker.tab === 'news') {
        const news = data.announcements.items.filter((a) => tracker.course === 'all' || a.courseId === tracker.course).slice(0, 10);
        set(
          body,
          news.length === 0
            ? empty('noAnnouncements')
            : h(
                'div',
                { class: 'group-items news' },
                news.map((a) =>
                  paint(
                    h(
                      'a',
                      { class: 'news-item', href: announcementHref(a) },
                      h('span', { class: 'ti-course' }, isUnread(a) ? h('span', { class: 'unread-dot', title: t('unread') }) : null, a.course),
                      h('span', { class: 'ti-title' }, a.title || t('untitled')),
                      h('span', { class: 'ti-due' }, formatShortDate(a.postedAt)),
                    ),
                    a.courseId,
                  ),
                ),
              ),
        );
        return;
      }
      if (tracker.tab === 'done') {
        const done = scoped.filter(isDone);
        set(body, done.length === 0 ? noTasks() : group(t('doneInPeriod'), done, now, { onToggle: drawRings }));
        return;
      }
      const overdue = includesNow ? data.overdue.items.filter((item) => inScope(item) && !isChecked(item)) : [];
      const open = scoped.filter((item) => !isDone(item) && Date.parse(item.due) >= now.getTime());
      const soon = open.filter((item) => Date.parse(item.due) - now.getTime() <= 2 * DAY_MS);
      const later = open.filter((item) => !soon.includes(item));
      const groups = [
        overdue.length > 0 ? group(t('overdue'), overdue, now, { late: true, onToggle: drawRings }) : null,
        soon.length > 0 ? group(t('dueSoon'), soon, now, { onToggle: drawRings }) : null,
        later.length > 0 ? group(t(tracker.period === 'day' ? 'dueToday' : tracker.period === 'month' ? 'dueThisMonth' : 'dueThisWeek'), later, now, { open: soon.length + overdue.length === 0, onToggle: drawRings }) : null,
      ].filter(Boolean);
      set(body, groups.length === 0 ? noTasks() : groups);
    }

    function feedbackItem(f) {
      const number = (n) => String(Math.round(n * 100) / 100);
      const score = f.excused ? t('excused') : f.score !== null ? (f.points !== null ? t('scoreOutOf', [number(f.score), number(f.points)]) : number(f.score)) : f.grade;
      const title = f.url
        ? h('a', {
            class: 'fb-title',
            href: f.url,
          }, f.title || t('untitled'))
        : h('span', { class: 'fb-title' }, f.title || t('untitled'));
      return h(
        'div',
        { class: 'fb-item' },
        icon('check'),
        h('div', null, title, h('span', { class: 'fb-meta' }, [f.course, score].filter(Boolean).join(' · ')), f.comment ? h('span', { class: 'fb-comment' }, `“${f.comment.slice(0, 140)}”`) : null),
      );
    }

    async function renderHome(token) {
      viewTitle(t('dashboard'));
      const cards = h('div', null, loading());
      const trackerBox = settings.showTodo ? h('div', { class: 'tracker-main' }, loading()) : null;
      const feedbackList = h('div', null, loading());
      const feedback = h('section', { class: 'feedback' }, h('h2', null, t('recentFeedback')), feedbackList);
      set(
        page,
        h(
          'div',
          { class: 'dash' },
          h(
            'div',
            { class: 'dash-main' },
            pageHead(t('dashboard'), null, [
              refreshItem(),
              { icon: 'palette', label: t('themes'), onClick: () => openThemes() },
              { icon: 'classic', label: t('classicView'), href: NeoRoutes.classicUrl(location.href) },
            ]),
            cards,
          ),
          h('aside', { class: settings.showTodo ? 'tracker' : 'dashboard-side', 'aria-label': t(settings.showTodo ? 'tracker' : 'recentFeedback') }, trackerBox, feedback),
        ),
      );
      store
        .feedback()
        .then((list) => {
          if (token === renderToken) set(feedbackList, list.length === 0 ? empty('noFeedback') : list.map(feedbackItem));
        })
        .catch(() => {
          if (token === renderToken) feedback.hidden = true;
        });

      let data;
      let courses;
      try {
        courses = await loadCourses();
        data = await store.today();
      } catch (error) {
        if (token === renderToken) set(cards, failed(errorKey(error)));
        return;
      }
      if (token !== renderToken) return;

      set(cards, courses.length === 0 ? empty('noCourses') : h('div', { class: settings.condensed ? 'cards condensed' : 'cards' }, courses.map((course) => courseCard(course, data))));
      if (trackerBox) await renderTracker(trackerBox, data, token);
    }

    async function renderCourse(token) {
      const { courseId } = route;
      const sectionName = route.section;
      const body = h('div', { class: 'course-body', dataset: { section: sectionName } }, loading());
      const head = h('div');
      const segments = NeoRoutes.SECTIONS.filter((name) => name !== 'syllabus').map((name) =>
        h('a', { href: navHref({ view: 'course', courseId, section: name }), 'aria-current': name === sectionName ? 'page' : null, dataset: { section: name } }, t(SECTION_LABELS[name])),
      );
      const syllabusLink = h('a', {
        class: sectionName === 'syllabus' ? 'more-link current' : 'more-link',
        href: navHref({ view: 'course', courseId, section: 'syllabus' }),
        'aria-current': sectionName === 'syllabus' ? 'page' : null,
        dataset: { section: 'syllabus' },
      }, t(SECTION_LABELS.syllabus));
      const more = h('nav', { class: 'more', 'aria-label': t('otherPages') }, syllabusLink);
      set(page, head, h('div', { class: 'course-nav' }, h('nav', { class: 'seg segmented', 'aria-label': t('sections') }, segments), more), body);

      store
        .tabs(courseId)
        .then((tabs) => {
          if (token !== renderToken) return;
          const available = NeoData.availableSections(tabs);
          if (available) for (const link of segments) link.hidden = !available.has(link.dataset.section) && link.dataset.section !== sectionName;
          syllabusLink.hidden = Boolean(available && !available.has('syllabus') && sectionName !== 'syllabus');
          set(
            more,
            syllabusLink,
            NeoData.toMenu(tabs).map((item) => {
              const inside = item.toolId !== null;
              const href = inside ? navHref({ view: 'course', courseId, section: 'tool', toolId: item.toolId }) : item.url;
              const current = sectionName === 'tool' && route.toolId === item.toolId;
              return h('a', { class: current ? 'more-link current' : 'more-link', href, 'aria-current': current ? 'page' : null }, item.label, inside ? null : icon('external'));
            }),
          );
        })
        .catch(() => {});

      let course;
      try {
        course = (await loadCourses()).find((c) => c.id === courseId) ?? (await store.course(courseId));
      } catch {
        course = null;
      }
      if (token !== renderToken) return;
      const name = course?.name || t('course');
      viewTitle(name);
      head.replaceWith(
        pageHead(name, [course?.code, course?.section ? t('sectionNumber', [course.section]) : null, course?.term].filter(Boolean).join(' · '), [
          refreshItem(),
          ...coverItems(courseId),
          { icon: 'classic', label: t('classicView'), href: NeoRoutes.classicUrl(location.href) },
        ]),
      );

      const views = {
        overview: courseOverview,
        assignments: courseAssignments,
        announcements: courseAnnouncements,
        files: courseFiles,
        modules: courseModules,
        grades: courseGrades,
        syllabus: courseSyllabus,
        tool: courseTool,
      };
      await views[sectionName](courseId, body, token);
    }

    async function fill(target, token, load, build) {
      try {
        const value = await load();
        if (token === renderToken) set(target, build(value));
      } catch (error) {
        if (token === renderToken) set(target, failed(errorKey(error)));
      }
    }

    async function courseOverview(courseId, body, token) {
      const upcoming = h('div', null, loading());
      const latest = h('div', null, loading());
      set(body, h('div', { class: 'columns' }, h('div', { class: 'stack' }, section(t('upcomingAssignments'), upcoming)), h('div', { class: 'stack' }, section(t('recentAnnouncements'), latest))));
      const now = new Date();
      await Promise.all([
        fill(upcoming, token, () => store.assignments(courseId), (groups) => {
          const items = [...groups.missing, ...groups.upcoming].slice(0, 6);
          return items.length === 0 ? empty('noUpcoming') : h('ul', { class: 'list' }, items.map((a) => assignmentRow(courseId, a, now)));
        }),
        fill(latest, token, () => store.announcements(courseId), (list) =>
          list.length === 0 ? empty('noAnnouncements') : h('ul', { class: 'list' }, list.slice(0, 4).map((item) => announcementRow(item, { showCourse: false }))),
        ),
      ]);
    }

    function assignmentRow(courseId, a, now, quiz = null) {
      const days = NeoData.daysUntil(a.due, now);
      const past = a.due && Date.parse(a.due) < now.getTime();
      const urgent = !a.submitted && !past && a.due && Date.parse(a.due) - now.getTime() < DAY_MS;
      const lead = !a.due
        ? pill('—')
        : past && !a.missing
          ? pill(formatMd(a.due))
          : pill(NeoData.dDayLabel(a.due, now), a.missing ? 'late' : urgent || (!a.submitted && days === 0) ? 'soon' : '');
      let trail;
      let trailClass = '';
      if (a.excused) trail = t('excused');
      else if (a.score !== null) {
        trail = a.points !== null ? `${a.score} / ${a.points}` : String(a.score);
        trailClass = 'score';
      } else if (a.submitted) trail = [icon('check'), t('submitted')];
      else if (a.missing) {
        trail = t('notSubmitted');
        trailClass = 'late';
      } else trail = icon('external', 'icon go');
      return row({
        lead,
        href: a.url,
        title: a.title,
        meta: metaLine(
          a.isQuiz ? t('typeQuiz') : null,
          quiz?.timeLimit ? t('timeLimit', [String(quiz.timeLimit)]) : null,
          quiz?.attempts > 0 ? t('attempts', [String(quiz.attempts)]) : null,
          !a.due ? t('noDueDate') : past && !a.missing ? null : dateSpan(formatDateTime(a.due)),
          a.points !== null && a.score === null ? t('points', [String(a.points)]) : null,
        ),
        trail: h('span', { class: `trail-inner ${trailClass}`.trim() }, trail),
        done: a.submitted && !a.missing,
      });
    }

    async function courseAssignments(courseId, body, token) {
      let groups;
      let quizzes;
      try {
        [groups, quizzes] = await Promise.all([store.assignments(courseId), store.quizzes(courseId)]);
      } catch (error) {
        if (token === renderToken) set(body, failed(errorKey(error)));
        return;
      }
      if (token !== renderToken) return;
      const now = new Date();
      const list = h('div');
      for (const [key, label, late] of [
        ['missing', 'assignmentsMissing', true],
        ['upcoming', 'assignmentsUpcoming', false],
        ['undated', 'assignmentsUndated', false],
        ['past', 'assignmentsPast', false],
      ]) {
        if (groups[key].length === 0) continue;
        list.append(section(t(label), h('ul', { class: 'list' }, groups[key].map((a) => assignmentRow(courseId, a, now, a.quizId ? quizzes.get(a.quizId) : null))), { count: groups[key].length, late }));
      }
      if (list.childElementCount === 0) list.append(empty('noAssignments'));
      set(body, list);
    }

    async function courseAnnouncements(courseId, body, token) {
      let list;
      try {
        list = await store.announcements(courseId);
      } catch (error) {
        if (token === renderToken) set(body, failed(errorKey(error)));
        return;
      }
      if (token !== renderToken) return;

      if (list.length === 0) {
        set(body, h('div', { class: 'panel' }, empty('noAnnouncements')));
        return;
      }

      const split = h('div', { class: 'split' });
      const listPane = h('div', { class: 'pane-list panel' });
      const reader = h('article', { class: 'reader panel' });
      split.append(listPane, reader);
      set(body, split);

      const selectedId = () => (location.hash.match(/^#a-(\d+)$/) ?? [])[1] ?? null;

      function show(item, { fromUser, opened = fromUser }) {
        for (const link of listPane.querySelectorAll('.ann')) link.setAttribute('aria-current', link.dataset.id === item.id ? 'true' : 'false');
        if (opened) {
          markRead(item);
          listPane.querySelector(`.ann[data-id="${item.id}"] .unread-dot`)?.remove();
        }
        set(
          reader,
          h('button', { class: 'tool back', onclick: () => split.classList.remove('reading') }, icon('back'), t('back')),
          h('h2', { class: 'reader-title' }, item.title || t('untitled')),
          metaLine(item.author, dateSpan(formatDateTime(item.postedAt))),
          h('div', { class: 'prose', lang: proseLanguage(NeoSanitize.toText(item.message)) }, NeoSanitize.sanitize(item.message, doc)),
          item.url ? h('a', { class: 'open-original raised', href: item.url }, t('openOriginal'), icon('external')) : null,
        );
        if (fromUser) {
          split.classList.add('reading');
          history.replaceState(null, '', `${location.pathname}${location.search}#a-${item.id}`);
        }
      }

      listPane.append(
        ...list.map((item) =>
          h(
            'a',
            {
              class: 'ann',
              href: `#a-${item.id}`,
              dataset: { id: item.id },
              onclick: (event) => {
                event.preventDefault();
                show(item, { fromUser: true });
              },
            },
            h('span', { class: 'title', lang: proseLanguage(item.title || '') }, isUnread(item) ? h('span', { class: 'unread-dot', title: t('unread') }) : null, item.title || t('untitled')),
            metaLine(dateSpan(formatShortDate(item.postedAt)), item.author),
          ),
        ),
      );

      const chosen = list.find((item) => item.id === selectedId());
      show(chosen ?? list[0], { fromUser: false, opened: Boolean(chosen) });
      if (chosen) split.classList.add('reading');
    }

    function fileLead(name) {
      const kind = NeoData.fileKind(name);
      const symbol = { PDF: 'fileText', DOC: 'fileText', DOCX: 'fileText', ZIP: 'fileArchive', PPT: 'fileSlides', PPTX: 'fileSlides', XLS: 'fileSheet', XLSX: 'fileSheet' }[kind] ?? 'file';
      return h('span', { class: 'kind', title: kind || t('moduleFile') }, icon(symbol));
    }

    async function courseFiles(courseId, body, token) {
      let result;
      try {
        result = await store.files(courseId);
      } catch (error) {
        if (token === renderToken) set(body, failed(errorKey(error)));
        return;
      }
      if (token !== renderToken) return;
      if (result.source === 'none') {
        set(body, h('div', { class: 'panel' }, empty('filesUnavailable')));
        return;
      }
      if (result.source === 'modules') {
        const list = h(
          'div',
          null,
          result.modules.map((m) =>
            section(
              m.name || t('untitled'),
              h(
                'ul',
                { class: 'list' },
                m.items.map((f) =>
                  row({ lead: fileLead(f.name), href: f.locked ? null : f.url, title: f.name, meta: f.locked ? metaLine(t('locked')) : null, trail: f.locked ? null : icon('external', 'icon go') }),
                ),
              ),
              { count: m.items.length },
            ),
          ),
        );
        set(body, list);
        return;
      }
      const files = result.items;
      const wrapper = section(
        t('sectionFiles'),
        h(
          'ul',
          { class: 'list' },
          files.map((f) =>
            row({
              lead: fileLead(f.name),
              href: f.locked ? null : f.url,
              title: f.name,
              meta: metaLine(NeoData.fileKind(f.name), f.folder, NeoData.formatSize(f.size), dateSpan(formatShortDate(f.updatedAt)), f.locked ? t('locked') : null),
              trail: f.locked ? null : icon('download', 'icon go'),
            }),
          ),
        ),
        { count: files.length },
      );
      set(body, wrapper);
    }

    async function courseModules(courseId, body, token) {
      let modules;
      try {
        modules = await store.modules(courseId);
      } catch (error) {
        if (token === renderToken) set(body, h('div', { class: 'panel' }, failed(refusedKey(error, 'modulesUnavailable'))));
        return;
      }
      if (token !== renderToken) return;
      if (modules.length === 0) {
        set(body, h('div', { class: 'panel' }, empty('noModules')));
        return;
      }
      const now = new Date();
      const list = h(
        'div',
        null,
        modules.map((m) => {
          const required = m.items.filter((i) => i.requirement);
          const done = required.filter((i) => i.completed).length;
          return section(
            m.name || t('untitled'),
            h(
              'ul',
              { class: 'list' },
              m.items.map((item) => {
                if (item.type === 'SubHeader') return h('li', { class: 'subheader' }, item.title);
                return row({
                  lead: h('span', { class: 'kind' }, icon(MODULE_ICONS[item.type] ?? 'doc')),
                  href: item.locked ? null : item.url,
                  title: item.title,
                  meta: metaLine(item.due ? dateSpan(`${formatDateTime(item.due)} · ${NeoData.dDayLabel(item.due, now)}`) : null, item.locked ? t('locked') : null),
                  trail: item.requirement ? h('span', { class: item.completed ? 'req done' : 'req' }, icon('check'), t(item.completed ? 'requirementDone' : 'requirementTodo')) : null,
                });
              }),
            ),
            { aside: required.length > 0 ? t('moduleProgress', [String(done), String(required.length)]) : null },
          );
        }),
      );
      set(body, list);
    }

    async function courseGrades(courseId, body, token) {
      let grades;
      try {
        grades = await store.grades(courseId);
      } catch (error) {
        if (token === renderToken) set(body, h('div', { class: 'panel' }, failed(refusedKey(error, 'gradesUnavailable'))));
        return;
      }
      if (token !== renderToken) return;
      const total = h(
        'div',
        { class: 'panel grade-total' },
        h('span', { class: 'grade-number' }, grades.official !== null ? percent(grades.official) : '—'),
        h('b', null, t('gradeCurrent')),
      );
      const groups = grades.groups
        .filter((g) => g.assignments.length > 0)
        .map((g) =>
          section(
            g.name || t('untitled'),
            h(
              'ul',
              { class: 'list' },
              g.assignments.map((a) => {
                const ratio = a.score !== null && a.points > 0 ? a.score / a.points : null;
                return row({
                  lead: pill(ratio !== null ? `${Math.round(ratio * 100)}%` : '—'),
                  href: a.url,
                  title: a.title,
                  meta: metaLine(a.excused ? t('excused') : null, a.omit ? t('notCounted') : null, a.due ? dateSpan(formatShortDate(a.due)) : null),
                  trail: h('span', { class: a.score !== null ? 'trail-inner score' : 'trail-inner' }, a.score !== null ? `${a.score} / ${a.points}` : `— / ${a.points}`),
                });
              }),
            ),
            { aside: grades.weighted && g.weight ? t('groupWeight', [String(g.weight)]) : null },
          ),
        );
      set(body, total, groups.length > 0 ? groups : h('div', { class: 'panel' }, empty('noGrades')));
    }

    async function courseSyllabus(courseId, body, token) {
      let syllabus;
      try {
        syllabus = await store.syllabus(courseId);
      } catch (error) {
        if (token === renderToken) set(body, h('div', { class: 'panel' }, failed(errorKey(error))));
        return;
      }
      if (token !== renderToken) return;
      const text = NeoSanitize.sanitize(syllabus.html, doc);
      const hasContent = Boolean(text.textContent.trim() || text.querySelector('img, table, hr'));
      set(
        body,
        h(
          'div',
          { class: syllabus.external && !hasContent ? 'panel reader syllabus-link-only' : 'panel reader' },
          syllabus.external ? h('a', { class: 'open-original raised first', href: syllabus.external, target: '_blank', rel: 'noopener noreferrer' }, t('syllabusExternal'), icon('external')) : null,
          hasContent ? h('div', { class: 'prose', lang: proseLanguage(text.textContent) }, text) : syllabus.external ? null : empty('noSyllabus'),
        ),
      );
    }

    async function courseTool(courseId, body) {
      const frame = h('iframe', {
        class: 'tool-frame',
        src: `/courses/${courseId}/external_tools/${route.toolId}?display=borderless`,
        title: t('learningxTool'),
        allow: 'fullscreen; autoplay; encrypted-media; picture-in-picture',
        allowfullscreen: true,
      });
      set(body, frame);
      const timer = setInterval(() => {
        const exam = examIn(frame.contentWindow, 0);
        if (exam) {
          clearInterval(timer);
          location.assign(exam);
        }
      }, 500);
      cleanups.push(() => clearInterval(timer));
    }

    function examIn(win, depth) {
      if (!win || depth > 5) return null;
      let href;
      try {
        href = win.location.href;
      } catch {
        return null;
      }
      if (NeoGuard.isExamUrl(href)) return href;
      try {
        if (NeoGuard.hasQuizContent(win.document)) return href;
      } catch {}
      for (let i = 0; i < win.frames.length; i++) {
        const found = examIn(win.frames[i], depth + 1);
        if (found) return found;
      }
      return null;
    }

    function openThemes() {
      const controls = h('div', { class: 'theme-controls' });
      let moreOpen = false;
      const previewScreen = h('div', { class: 'theme-preview-screen' });
      const preview = h('div', { class: 'theme-preview', inert: true, 'aria-hidden': 'true' }, previewScreen);
      const body = h('div', { class: 'theme-workspace' }, h('section', { class: 'theme-preview-panel', 'aria-label': t('preview') }, h('h3', { class: 'preview-label' }, t('preview')), preview), controls);
      const panel = openSheet(t('customise'), body);
      panel.classList.add('theme-sheet');
      overlay.classList.add('theme-backdrop');

      const sizePreview = () => {
        const scale = preview.clientWidth / 1200;
        previewScreen.style.transform = `scale(${scale})`;
        preview.style.height = `${750 * scale}px`;
      };
      const observer = new ResizeObserver(sizePreview);
      observer.observe(preview);
      overlayCleanup = () => observer.disconnect();

      function drawPreview() {
        const copy = app.cloneNode(true);
        for (const node of copy.querySelectorAll('iframe, video, audio')) node.remove();
        for (const node of copy.querySelectorAll('[id]')) node.removeAttribute('id');
        copy.classList.remove('menu-open');
        for (const card of copy.querySelectorAll('.card[data-course]')) paint(card, card.dataset.course, { background: true });
        for (const link of copy.querySelectorAll('.sidebar nav a[href]')) {
          const courseId = NeoRoutes.parse(link.href)?.courseId;
          if (courseId) paint(link, courseId);
        }
        for (const item of copy.querySelectorAll('.track-item, .news-item')) {
          const course = courseList.find((c) => c.name === item.querySelector('.ti-course')?.textContent);
          if (course) paint(item, course.id);
        }
        for (const button of copy.querySelectorAll('.legend button')) {
          const course = courseList.find((c) => c.name === button.textContent);
          if (course) paint(button.querySelector('.mini'), course.id);
        }
        for (const arc of copy.querySelectorAll('.rings circle:has(title)')) {
          const course = courseList.find((c) => arc.textContent.startsWith(`${c.name}:`));
          if (course) {
            arc.setAttribute('stroke', colorOf(course.id));
            arc.previousElementSibling.setAttribute('stroke', colorOf(course.id));
          }
        }
        copy.querySelector('.cards')?.classList.toggle('condensed', settings.condensed);
        set(previewScreen, copy);
        sizePreview();
      }

      const radio = (checked, label, onPick, extra = null) => {
        const button = h('button', { class: 'option', role: 'radio', 'aria-checked': String(checked) }, extra, label);
        button.addEventListener('click', onPick);
        return button;
      };
      const pick = async (patch) => {
        await save(patch);
        applyTheme();
        draw();
      };

      function tile(id, th) {
        const side = h('span', { class: 'tile-side' });
        side.style.background = th.sidebar;
        const line = h('span', { class: 'tile-line' });
        line.style.background = th.text;
        const cards = h(
          'span',
          { class: 'tile-cards' },
          th.palette.slice(0, 3).map((color, i) => {
            const c = h('span');
            c.style.background = NeoThemes.cardBackground(color, settings.cardStyle, i);
            return c;
          }),
        );
        const main = h('span', { class: 'tile-main' }, line, cards);
        main.style.background = th.wallpaper ? `${th.wallpaper}, ${th.bg}` : th.bg;
        const label = id === 'auto' ? t('themeAuto') : id === 'custom' ? t('themeCustom') : th.name;
        const button = h('button', { class: 'tile', role: 'radio', 'aria-checked': String(settings.theme === id), title: label, dataset: { theme: id } }, h('span', { class: 'tile-preview' }, side, main), h('span', { class: 'tile-name' }, label));
        button.style.fontFamily = NeoThemes.fontStack('theme', th);
        button.style.fontSizeAdjust = NeoThemes.fontStack('theme', th) === NeoThemes.FONTS.personal ? '0.43' : 'none';
        button.addEventListener('click', () => pick({ theme: id }));
        return button;
      }

      function draw() {
        const scrollTop = controls.scrollTop;
        const c = settings.customTheme;
        const themes = [['auto', NeoThemes.resolve('auto', darkQuery.matches)], ...Object.entries(NeoThemes.THEMES), ['custom', NeoThemes.custom(c)]];

        const colorInput = (key, label) => {
          const input = h('input', { type: 'color', value: c[key], 'aria-label': label });
          input.addEventListener('change', () => pick({ theme: 'custom', customTheme: { ...settings.customTheme, [key]: input.value } }));
          return h('label', { class: 'color-field' }, input, label);
        };

        const palettes = Object.entries(NeoThemes.PALETTES).map(([id, colors]) => {
          const own = courseList.map((x) => x.color).filter(Boolean);
          const shown = colors ?? (id === 'course' && own.length > 0 ? own : theme.palette);
          const swatch = h(
            'span',
            { class: 'swatch' },
            shown.slice(0, 5).map((color) => {
              const dot = h('span');
              dot.style.background = color;
              return dot;
            }),
          );
          const button = radio(settings.cardPalette === id, t(`palette_${id}`), () => pick({ cardPalette: id }), swatch);
          button.dataset.palette = id;
          return button;
        });

        const fontIds = ['theme', 'personal', 'sans', 'rounded', 'serif', 'mono', 'apple'].filter((id) => id !== 'personal' || NeoThemes.hasSignatureFonts());
        const fonts = fontIds.map((id) => {
          const button = radio(settings.font === id, t(`font_${id}`), () => pick({ font: id }));
          button.style.fontFamily = NeoThemes.fontStack(id, theme);
          button.style.fontSizeAdjust = NeoThemes.fontStack(id, theme) === NeoThemes.FONTS.personal ? '0.43' : 'none';
          button.dataset.font = id;
          return button;
        });

        const thumb = h('span', { class: 'wallpaper-thumb' });
        if (settings.wallpaperImage) thumb.style.setProperty('--thumb', `url("${settings.wallpaperImage}")`);
        const upload = radio(
          settings.wallpaper === 'image',
          t('wallpaperImage'),
          async () => {
            const url = await pickImage(2400);
            if (url) {
              if (!(await save({ wallpaper: 'image', wallpaperImage: url }))) toast(t('pictureNotSaved'));
              applyTheme();
              draw();
            } else if (settings.wallpaperImage) await pick({ wallpaper: 'image' });
          },
          thumb,
        );
        upload.dataset.wallpaper = 'image';

        const toggle = (key, label) => {
          const input = h('input', { type: 'checkbox', class: 'switch', dataset: { setting: key } });
          input.checked = Boolean(settings[key]);
          input.addEventListener('change', () => pick({ [key]: input.checked }));
          return h('label', { class: 'toggle-row' }, h('span', null, label), input);
        };

        const codeOut = h('input', { class: 'code-field', readonly: true, value: NeoThemes.encodeCode(settings), 'aria-label': t('themeCode') });
        const copy = h('button', { class: 'option' }, icon('copy'), h('span', null, t('copyCode')));
        copy.addEventListener('click', async () => {
          codeOut.select();
          try {
            await navigator.clipboard.writeText(codeOut.value);
            copy.lastChild.textContent = t('copied');
          } catch {}
        });
        const codeIn = h('input', { class: 'code-field code-in', placeholder: 'NEO1:…', 'aria-label': t('pasteCode') });
        const applyCode = h('button', { class: 'option apply-code' }, t('applyCode'));
        const codeMessage = h('p', { class: 'error', role: 'status', hidden: true });
        applyCode.addEventListener('click', () => {
          const decoded = NeoThemes.decodeCode(codeIn.value);
          if (decoded) pick(decoded);
          else {
            codeMessage.textContent = t('badCode');
            codeMessage.hidden = false;
          }
        });

        const css = h('textarea', { class: 'css-field', spellcheck: 'false', placeholder: '.card { border-radius: 4px; }', 'aria-label': t('customCss') });
        css.value = settings.customCss ?? '';
        const applyCss = h('button', { class: 'option' }, t('applyCss'));
        applyCss.addEventListener('click', () => pick({ customCss: css.value.slice(0, 20000) }));

        const settingRow = (label, options) => h('section', { class: 'setting-row' }, h('h3', null, label), options);

        set(
          controls,
          h('div', { class: 'theme-grid', role: 'radiogroup', 'aria-label': t('themes') }, themes.map(([id, th]) => tile(id, th))),
          settings.theme === 'custom'
            ? h(
                'div',
                { class: 'custom-builder' },
                h('h3', null, t('themeCustom')),
                h('div', { class: 'options' }, radio(c.mode === 'light', t('modeLight'), () => pick({ customTheme: { ...c, mode: 'light' } })), radio(c.mode === 'dark', t('modeDark'), () => pick({ customTheme: { ...c, mode: 'dark' } }))),
                h('div', { class: 'options colors' }, colorInput('accent', t('colorAccent')), colorInput('bg', t('colorBackground')), colorInput('sidebar', t('colorSidebar'))),
              )
            : null,
          settingRow(t('cardColors'), h('div', { class: 'options' }, palettes)),
          settingRow(t('cardStyle'), h('div', { class: 'options' }, NeoThemes.CARD_STYLES.map((id) => radio(settings.cardStyle === id, t(`style_${id}`), () => pick({ cardStyle: id }))))),
          settingRow(t('font'), h('div', { class: 'options' }, fonts)),
          settingRow(t('wallpaper'), h('div', { class: 'options' }, radio(settings.wallpaper === 'theme', t('wallpaperTheme'), () => pick({ wallpaper: 'theme' })), radio(settings.wallpaper === 'none', t('wallpaperNone'), () => pick({ wallpaper: 'none' })), upload)),
          h('details', {
            class: 'theme-more',
            open: moreOpen,
            ontoggle: (event) => { if (event.currentTarget.isConnected) moreOpen = event.currentTarget.open; },
          },
            h('summary', null, t('moreOptions'), icon('chevDown')),
            toggle('condensed', t('condensedCards')),
            toggle('showTodo', t('todoList')),
            toggle('tabIcons', t('tabIcons')),
            h('h3', null, t('themeCode')),
            h('div', { class: 'code-row' }, codeOut, copy),
            h('div', { class: 'code-row' }, codeIn, applyCode),
            codeMessage,
            h('h3', null, t('customCss')),
            css,
            h('div', { class: 'options' }, applyCss),
          ),
        );
        drawPreview();
        controls.scrollTop = scrollTop;
      }
      draw();
    }

    async function render({ scroll }) {
      const next = NeoRoutes.parse(location.href);
      if (!next) {
        location.reload();
        return;
      }
      for (const cleanup of cleanups) cleanup();
      cleanups = [];
      closeOverlay();
      closeMenus();
      route = next;
      const token = ++renderToken;
      app.classList.remove('menu-open');
      classicLink.href = NeoRoutes.classicUrl(location.href);
      if (scroll) content.scrollTop = 0;
      renderPages();
      renderSidebar(token);
      if (route.view === 'today') await renderHome(token);
      else await renderCourse(token);
    }

    applyTheme();
    render({ scroll: false });
    renderAvatar();

    return {
      setSettings(next, changedKeys = []) {
        settings = next;
        if (!changedKeys.some((key) => LOOK_KEYS.includes(key))) return;
        applyTheme();
        refreshView();
      },
      destroy() {
        renderToken++;
        for (const cleanup of cleanups) cleanup();
        window.removeEventListener('popstate', onPopState);
        darkQuery.removeEventListener('change', onSchemeChange);
        doc.removeEventListener('keydown', onKey);
        closeOverlay();
        restoreTabIcon();
        doc.documentElement.style.removeProperty('--neo-bg');
        host.remove();
      },
    };
  }

  return { mount };
})();
