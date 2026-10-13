const NeoData = (() => {
  const ORIGIN = 'https://myetl.snu.ac.kr';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const WINDOW_DAYS = 14;
  const ANNOUNCEMENT_GROUP = 10;
  const DEADLINE_TYPES = new Set([
    'assignment',
    'quiz',
    'discussion_topic',
    'sub_assignment',
    'wiki_page',
    'planner_note',
    'calendar_event',
    'assessment_request',
  ]);

  function linkOnMyEtl(href) {
    if (!href) return null;
    try {
      const url = new URL(href, ORIGIN);
      return url.origin === ORIGIN ? url.href : null;
    } catch {
      return null;
    }
  }

  function safeColor(value) {
    return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) ? value : null;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function daysUntil(iso, now = new Date()) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS);
  }

  function dDayLabel(iso, now = new Date()) {
    const days = daysUntil(iso, now);
    if (days === null) return '—';
    if (days === 0) return 'D-day';
    return days > 0 ? `D-${days}` : `D+${-days}`;
  }

  function byDate(key, direction = 1) {
    return (a, b) => direction * ((Date.parse(a[key]) || Infinity) - (Date.parse(b[key]) || Infinity));
  }

  function cleanCourseName(name) {
    const match = String(name ?? '').match(/^\d{4}-[0-9A-Za-z]+\s+(.+?)(?:\s*\((\d{3})\))?$/);
    return match ? { title: match[1], section: match[2] ?? '' } : { title: String(name ?? ''), section: '' };
  }

  const termOf = (c) => c.enrollment_term_id ?? c.term?.id ?? null;

  function currentScore(course) {
    if (course.hide_final_grades) return null;
    const e = (course.enrollments ?? []).find((en) => en.type === 'student' || en.type === 'StudentEnrollment') ?? course.enrollments?.[0];
    if (!e) return null;
    const score = e.has_grading_periods ? e.current_period_computed_current_score : e.computed_current_score;
    return typeof score === 'number' ? score : null;
  }

  const SEASON_ORDER = { 1: 1, S: 2, 2: 3, W: 4 };

  function semesterOf(course) {
    const match = /^(\d{4})-([0-9A-Za-z]+)\s/.exec(course.name ?? '');
    return match ? { key: `${match[1]}-${match[2]}`, rank: Number(match[1]) * 10 + (SEASON_ORDER[match[2].toUpperCase()] ?? 0) } : null;
  }

  function currentTermOnly(courses) {
    const terms = courses.map(termOf).filter((id) => id !== null);
    if (terms.length === 0) return courses;
    const newest = Math.max(...terms.map(Number));
    const semesters = courses.map(semesterOf).filter(Boolean);
    const latest = semesters.length > 0 ? Math.max(...semesters.map((x) => x.rank)) : null;
    return courses.filter((c) => {
      if (termOf(c) === null || Number(termOf(c)) === newest) return true;
      const semester = semesterOf(c);
      return semester !== null && semester.rank === latest;
    });
  }

  function toCourses(courses, colors = {}, cards = null) {
    const custom = colors.custom_colors ?? {};
    const position = new Map((cards ?? []).filter((card) => card && card.id != null).map((card, i) => [String(card.id), card.position ?? i]));
    const byDashboard = (a, b) => {
      const pa = position.get(a.id);
      const pb = position.get(b.id);
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined || pb !== undefined) return pa !== undefined ? -1 : 1;
      return a.name.localeCompare(b.name, 'ko');
    };
    const eligible = courses.filter((c) => c && c.id != null && !c.access_restricted_by_date);
    const visible = Array.isArray(cards) ? eligible.filter((c) => position.has(String(c.id))) : currentTermOnly(eligible);
    return visible
      .map((c) => {
        const { title, section } = cleanCourseName(c.name || c.course_code);
        return {
          id: String(c.id),
          name: title,
          fullName: c.name ?? '',
          section,
          code: c.course_code ?? '',
          term: c.term?.name ?? '',
          color: safeColor(custom[`course_${c.id}`]),
          score: currentScore(c),
        };
      })
      .sort(byDashboard);
  }

  function courseNames(courses) {
    return new Map(courses.map((c) => [String(c.id), c.name || c.code || '']));
  }

  function endOfDayIfAllDay(iso, allDay) {
    if (!iso || !allDay) return iso;
    const d = new Date(iso);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString();
  }

  function toDeadlines(plannerItems, missing, courses) {
    const names = courseNames(courses);
    const current = (courseId) => courseId === null || courseId === undefined || names.has(String(courseId));
    const byId = new Map();
    for (const a of missing) {
      if (a.planner_override?.marked_complete || !names.has(String(a.course_id))) continue;
      const isQuiz = Boolean(a.is_quiz_assignment || a.is_quiz_lti_assignment || a.quiz_id || (a.submission_types ?? []).includes('online_quiz'));
      byId.set(`assignment-${a.id}`, {
        id: `assignment-${a.id}`,
        type: isQuiz ? 'quiz' : 'assignment',
        title: a.name ?? '',
        courseId: String(a.course_id ?? ''),
        course: names.get(String(a.course_id)) ?? '',
        due: a.due_at ?? null,
        url: linkOnMyEtl(a.html_url),
        done: false,
        missing: true,
      });
    }
    for (const item of plannerItems) {
      if (!DEADLINE_TYPES.has(item.plannable_type) || !current(item.course_id)) continue;
      const p = item.plannable ?? {};
      const subs = item.submissions || {};
      const override = item.planner_override ?? {};
      const resubmit = Boolean(subs.redo_request);
      const id = p.assignment_id ? `assignment-${p.assignment_id}` : `${item.plannable_type}-${item.plannable_id}`;
      byId.set(id, {
        id,
        type: item.plannable_type,
        title: p.title ?? p.name ?? '',
        courseId: String(item.course_id ?? ''),
        course: names.get(String(item.course_id)) ?? cleanCourseName(item.context_name).title,
        due: endOfDayIfAllDay(p.due_at ?? p.todo_date ?? item.plannable_date ?? null, p.all_day),
        url: item.plannable_type === 'planner_note' ? linkOnMyEtl(p.linked_object_html_url) : linkOnMyEtl(item.html_url ?? p.linked_object_html_url),
        done:
          override.marked_complete === false || resubmit
            ? false
            : Boolean(subs.submitted || subs.excused || (subs.graded && !subs.missing) || override.marked_complete || override.dismissed),
        points: typeof p.points_possible === 'number' ? p.points_possible : null,
        submitted: Boolean(subs.submitted) && !resubmit,
        graded: Boolean(subs.graded && !subs.submitted && !subs.missing),
        missing: Boolean(subs.missing),
      });
    }
    return [...byId.values()].sort(byDate('due'));
  }

  function toFeedback(stream, courses, limit = 5) {
    const names = courseNames(courses);
    return (Array.isArray(stream) ? stream : [])
      .filter((item) => item.type === 'Submission' && names.has(String(item.course_id)) && (typeof item.score === 'number' || item.grade || item.excused))
      .map((item) => {
        const a = item.assignment ?? {};
        const comments = item.submission_comments ?? [];
        const last = comments[comments.length - 1];
        return {
          id: `feedback-${item.assignment_id ?? a.id ?? item.id}`,
          title: a.name ?? item.title ?? '',
          courseId: String(item.course_id),
          course: names.get(String(item.course_id)) ?? '',
          score: typeof item.score === 'number' ? item.score : null,
          grade: item.grade ?? null,
          points: typeof a.points_possible === 'number' ? a.points_possible : null,
          excused: Boolean(item.excused),
          comment: last?.comment ?? '',
          url: linkOnMyEtl(a.html_url ?? item.html_url),
          at: item.graded_at ?? item.updated_at ?? null,
        };
      })
      .sort(byDate('at', -1))
      .slice(0, limit);
  }

  function toUser(user) {
    const name = String(user?.short_name || user?.name || '').trim();
    let avatar = null;
    try {
      const url = new URL(user?.avatar_url || 'about:blank', ORIGIN);
      if (url.origin === ORIGIN && !/avatar-50\.png|\/images\/messages\/avatar/.test(url.pathname)) avatar = url.href;
    } catch {
      avatar = null;
    }
    return { name, initials: initialsOf(name), avatar };
  }

  function initialsOf(name) {
    const text = String(name ?? '').trim();
    if (!text) return '';
    if (/^[\uAC00-\uD7AF]+$/.test(text)) return text.length >= 3 ? text.slice(-2) : text;
    const words = text.split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map((w) => [...w][0].toUpperCase()).join('');
  }

  function splitDeadlines(deadlines, now = new Date(), days = WINDOW_DAYS) {
    const start = now.getTime();
    const end = start + days * DAY_MS;
    const overdue = [];
    const upcoming = [];
    for (const d of deadlines) {
      const due = Date.parse(d.due);
      if (!d.done && d.missing) overdue.push(d);
      else if (due < start || due > end) continue;
      else upcoming.push(d);
    }
    return { overdue, upcoming };
  }

  function localDate(ms) {
    const d = new Date(ms);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function groupByDay(items, key = 'due', now = new Date()) {
    const groups = [];
    for (const item of items) {
      const days = daysUntil(item[key], now);
      const last = groups[groups.length - 1];
      if (last && last.days === days) last.items.push(item);
      else groups.push({ days, date: item[key], items: [item] });
    }
    return groups;
  }

  function toAnnouncements(list, courses) {
    const names = courseNames(courses);
    return list
      .map((a) => {
        const courseId = String(a.context_code ?? '').replace(/^course_/, '');
        return {
          id: String(a.id),
          title: a.title ?? '',
          courseId,
          course: names.get(courseId) ?? '',
          author: a.author?.display_name ?? a.user_name ?? '',
          postedAt: a.posted_at ?? a.delayed_post_at ?? null,
          url: linkOnMyEtl(a.html_url),
          unread: a.read_state === 'unread',
          message: typeof a.message === 'string' ? a.message : '',
        };
      })
      .sort(byDate('postedAt', -1));
  }

  function submissionState(a, now) {
    const s = a.submission ?? {};
    const submitted = Boolean(s.submitted_at) || (['submitted', 'pending_review'].includes(s.workflow_state) && s.missing !== true);
    const needsSubmission = !(a.submission_types ?? []).every((t) => t === 'none' || t === 'not_graded' || t === 'on_paper');
    const past = a.due_at ? Date.parse(a.due_at) < now.getTime() : false;
    const score = typeof s.score === 'number' ? s.score : null;
    const markedMissing = s.missing === true || s.late_policy_status === 'missing';
    const gradedByHand = !submitted && score !== null && !markedMissing;
    const explicit = typeof s.missing === 'boolean' || ['none', 'extended'].includes(s.late_policy_status);
    const computed = past && needsSubmission && !submitted && !gradedByHand;
    return {
      submitted: submitted && !s.redo_request,
      excused: Boolean(s.excused),
      missing: !s.excused && (explicit ? markedMissing : computed),
      late: Boolean(s.late),
      score,
    };
  }

  function toAssignments(list, now = new Date()) {
    const groups = { missing: [], upcoming: [], undated: [], past: [] };
    for (const a of list) {
      const state = submissionState(a, now);
      const item = {
        id: String(a.id),
        title: a.name ?? '',
        due: a.due_at ?? null,
        url: linkOnMyEtl(a.html_url),
        points: typeof a.points_possible === 'number' ? a.points_possible : null,
        isQuiz: Boolean(a.is_quiz_assignment || a.is_quiz_lti_assignment || a.quiz_id || (a.submission_types ?? []).includes('online_quiz')),
        quizId: a.quiz_id ? String(a.quiz_id) : null,
        ...state,
      };
      if (!item.due) groups.undated.push(item);
      else if (Date.parse(item.due) >= now.getTime()) groups.upcoming.push(item);
      else if (item.missing) groups.missing.push(item);
      else groups.past.push(item);
    }
    groups.missing.sort(byDate('due'));
    groups.upcoming.sort(byDate('due'));
    groups.past.sort(byDate('due', -1));
    return groups;
  }

  function toFiles(files, folders = []) {
    const folderNames = new Map(
      folders.map((f) => [String(f.id), String(f.full_name ?? f.name ?? '').replace(/^course files\/?/, '')]),
    );
    return files
      .map((f) => ({
        id: String(f.id),
        name: f.display_name ?? f.filename ?? '',
        folder: folderNames.get(String(f.folder_id)) ?? '',
        size: typeof f.size === 'number' ? f.size : null,
        updatedAt: f.updated_at ?? f.modified_at ?? f.created_at ?? null,
        url: linkOnMyEtl(f.url),
        locked: Boolean(f.locked_for_user || f.hidden_for_user),
      }))
      .sort(byDate('updatedAt', -1));
  }

  function toModuleFiles(modules) {
    return modules
      .map((m) => ({
        id: String(m.id),
        name: m.name ?? '',
        items: (m.items ?? [])
          .filter((item) => item.type === 'File')
          .map((item) => ({
            id: String(item.id),
            name: item.title ?? '',
            url: linkOnMyEtl(item.html_url),
            locked: Boolean(item.content_details?.locked_for_user),
          })),
      }))
      .filter((m) => m.items.length > 0);
  }

  function toGrades(groups, course = {}) {
    return {
      weighted: Boolean(course.apply_assignment_group_weights),
      hidden: Boolean(course.hide_final_grades),
      official: currentScore(course),
      groups: [...groups]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((g) => ({
          id: String(g.id),
          name: g.name ?? '',
          weight: typeof g.group_weight === 'number' ? g.group_weight : 0,
          assignments: (g.assignments ?? [])
            .filter((a) => a.published !== false)
            .map((a) => {
              const s = a.submission ?? {};
              return {
                id: String(a.id),
                title: a.name ?? '',
                points: typeof a.points_possible === 'number' ? a.points_possible : 0,
                score: typeof s.score === 'number' ? s.score : null,
                excused: Boolean(s.excused),
                omit: Boolean(a.omit_from_final_grade),
                due: a.due_at ?? null,
                gradedAt: s.graded_at ?? null,
                url: linkOnMyEtl(a.html_url),
              };
            }),
        })),
    };
  }

  function toModules(modules) {
    return modules.map((m) => ({
      id: String(m.id),
      name: m.name ?? '',
      state: m.state ?? '',
      unlockAt: m.unlock_at ?? null,
      items: (m.items ?? []).map((item) => ({
        id: String(item.id),
        type: item.type ?? '',
        title: item.title ?? '',
        indent: Math.min(Number(item.indent) || 0, 4),
        url: item.type === 'SubHeader' ? null : linkOnMyEtl(item.html_url),
        due: item.content_details?.due_at ?? null,
        points: item.content_details?.points_possible ?? null,
        locked: Boolean(item.content_details?.locked_for_user),
        requirement: item.completion_requirement?.type ?? null,
        completed: Boolean(item.completion_requirement?.completed),
      })),
    }));
  }

  function frameSrc(html) {
    if (typeof DOMParser === 'function') {
      return new DOMParser().parseFromString(html, 'text/html').querySelector('iframe[src]')?.getAttribute('src') ?? null;
    }
    const raw = /<iframe[^>]+src=["']([^"']+)["']/i.exec(html)?.[1] ?? null;
    return raw ? raw.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : null;
  }

  function formatSize(bytes) {
    if (bytes === null || bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit++;
    }
    return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
  }

  function fileKind(name) {
    const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
    return ext.length > 0 && ext.length <= 4 ? ext.toUpperCase() : '';
  }

  const OWN_TABS = new Set(['home', 'assignments', 'announcements', 'files', 'modules', 'grades', 'syllabus']);

  function availableSections(tabs) {
    if (!Array.isArray(tabs) || tabs.length === 0) return null;
    const ids = new Set(tabs.filter((tab) => !tab.hidden).map((tab) => tab.id));
    if (ids.has('modules')) ids.add('files');
    const own = ['assignments', 'announcements', 'files', 'modules', 'grades', 'syllabus'];
    return new Set(['overview', ...own.filter((id) => ids.has(id))]);
  }

  function toolId(tab) {
    return /^context_external_tool_(\d+)$/.exec(tab.id ?? '')?.[1] ?? null;
  }

  function boardTabs(tabs) {
    return toMenu(tabs ?? []).filter((item) => item.external && /게시판|board/i.test(item.label));
  }

  function toMenu(tabs) {
    return tabs
      .filter((tab) => !tab.hidden && !OWN_TABS.has(tab.id) && linkOnMyEtl(tab.html_url))
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((tab) => ({
        id: String(tab.id),
        label: tab.label ?? '',
        url: linkOnMyEtl(tab.html_url),
        external: tab.type === 'external',
        toolId: tab.type === 'external' ? toolId(tab) : null,
      }));
  }

  function createStore(api) {
    const cache = new Map();
    const iso = (ms) => encodeURIComponent(new Date(ms).toISOString());

    function cached(key, load, ttl = 10 * 60 * 1000) {
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < ttl) return hit.promise;
      const promise = load().catch((error) => {
        cache.delete(key);
        throw error;
      });
      cache.set(key, { promise, at: Date.now() });
      return promise;
    }

    const SHORT = 2 * 60 * 1000;

    const courses = () =>
      cached('courses', async () => {
        const [list, colors, cards] = await Promise.all([
          api.get('/api/v1/courses?enrollment_state=active&include[]=term&include[]=total_scores&include[]=current_grading_period_scores&per_page=100'),
          api.get('/api/v1/users/self/colors').catch(() => ({})),
          api.get('/api/v1/dashboard/dashboard_cards').catch(() => null),
        ]);
        return toCourses(list, colors, Array.isArray(cards) ? cards : null);
      });

    const course = (id) =>
      cached(`course:${id}`, async () => toCourses([await api.get(`/api/v1/courses/${id}?include[]=term`)])[0] ?? null);

    async function announcementsFor(courseIds, startMs, endMs, perPage) {
      const path = (ids) =>
        `/api/v1/announcements?${ids.map((id) => `context_codes[]=course_${id}`).join('&')}` +
        `&start_date=${iso(startMs)}&end_date=${iso(endMs)}&per_page=${perPage}`;
      const groups = [];
      for (let i = 0; i < courseIds.length; i += ANNOUNCEMENT_GROUP) groups.push(courseIds.slice(i, i + ANNOUNCEMENT_GROUP));
      const results = await Promise.all(
        groups.map(async (group) => {
          try {
            return await api.get(path(group));
          } catch (error) {
            if (error.unauthenticated || group.length === 1) throw error;
            const single = await Promise.allSettled(group.map((id) => api.get(path([id]))));
            const loggedOut = single.find((r) => r.status === 'rejected' && r.reason?.unauthenticated);
            if (loggedOut) throw loggedOut.reason;
            if (single.every((r) => r.status === 'rejected')) throw single[0].reason;
            return single.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
          }
        }),
      );
      return results.flat();
    }

    const today = () =>
      cached('today', async () => {
        const now = new Date();
        const list = await courses();
        const from = localDate(now.getTime() - DAY_MS);
        const to = localDate(now.getTime() + (WINDOW_DAYS + 1) * DAY_MS);
        const [planner, missing, announcements] = await Promise.allSettled([
          api.get(`/api/v1/planner/items?start_date=${from}&end_date=${to}&per_page=100`),
          api.get('/api/v1/users/self/missing_submissions?filter[]=submittable&include[]=planner_overrides&per_page=100'),
          announcementsFor(list.map((c) => c.id), now.getTime() - WINDOW_DAYS * DAY_MS, now.getTime(), 50),
        ]);
        const value = (r) => (r.status === 'fulfilled' ? r.value : []);
        const { overdue, upcoming } = splitDeadlines(toDeadlines(value(planner), value(missing), list), now);
        return {
          now,
          overdue: { items: overdue, failed: missing.status === 'rejected' },
          upcoming: { items: upcoming, failed: planner.status === 'rejected' },
          announcements: { items: toAnnouncements(value(announcements), list), failed: announcements.status === 'rejected' },
        };
      }, SHORT);

    const assignments = (id) =>
      cached(`assignments:${id}`, async () =>
        toAssignments(await api.get(`/api/v1/courses/${id}/assignments?include[]=submission&order_by=due_at&per_page=100`)),
      );

    const announcements = (id) =>
      cached(`announcements:${id}`, async () => {
        const list = await announcementsFor([id], Date.now() - 365 * DAY_MS, Date.now(), 50);
        return toAnnouncements(list, await courses());
      });

    const refused = (error) => !error.unauthenticated && !error.rateLimited && [401, 403, 404].includes(error.status);

    const files = (id) =>
      cached(`files:${id}`, async () => {
        let list = [];
        try {
          list = await api.get(`/api/v1/courses/${id}/files?sort=updated_at&order=desc&per_page=100`);
        } catch (error) {
          if (!refused(error)) throw error;
        }
        if (list.length > 0) {
          const folders = await api.get(`/api/v1/courses/${id}/folders?per_page=100`).catch(() => []);
          return { source: 'files', items: toFiles(list, folders) };
        }
        let modules = [];
        try {
          modules = toModuleFiles(await api.get(`/api/v1/courses/${id}/modules?include[]=items&per_page=50`));
        } catch (error) {
          if (!refused(error)) throw error;
        }
        return modules.length > 0 ? { source: 'modules', modules } : { source: 'none' };
      });

    const tabs = (id) => cached(`tabs:${id}`, () => api.get(`/api/v1/courses/${id}/tabs`));
    const menu = async (id) => toMenu(await tabs(id));

    const grades = (id) =>
      cached(`grades:${id}`, async () => {
        const [groups, info] = await Promise.all([
          api.get(`/api/v1/courses/${id}/assignment_groups?include[]=assignments&include[]=submission&per_page=50`),
          api.get(`/api/v1/courses/${id}?include[]=total_scores&include[]=current_grading_period_scores`).catch(() => ({})),
        ]);
        return toGrades(groups, info);
      });

    const modules = (id) =>
      cached(`modules:${id}`, async () =>
        toModules(await api.get(`/api/v1/courses/${id}/modules?include[]=items&include[]=content_details&per_page=50`)),
      );

    const syllabus = (id) =>
      cached(`syllabus:${id}`, async () => {
        const course = await api.get(`/api/v1/courses/${id}?include[]=syllabus_body`);
        const html = course.syllabus_body ?? '';
        const frame = frameSrc(html);
        let external = null;
        try {
          external = frame && /^https:/.test(new URL(frame, ORIGIN).protocol) ? new URL(frame, ORIGIN).href : null;
        } catch {
          external = null;
        }
        return { html, external };
      });

    const assignment = (courseId, id) =>
      cached(`assignment:${courseId}:${id}`, async () => {
        const [a, submission] = await Promise.all([
          api.get(`/api/v1/courses/${courseId}/assignments/${id}?include[]=submission`),
          api.get(`/api/v1/courses/${courseId}/assignments/${id}/submissions/self?include[]=submission_comments`).catch(() => null),
        ]);
        const s = submission ?? a.submission ?? {};
        return {
          id: String(a.id),
          title: a.name ?? '',
          description: a.description ?? '',
          due: a.due_at ?? null,
          lockAt: a.lock_at ?? null,
          unlockAt: a.unlock_at ?? null,
          lockedForUser: Boolean(a.locked_for_user),
          lockExplanation: typeof a.lock_explanation === 'string' ? a.lock_explanation : '',
          points: typeof a.points_possible === 'number' ? a.points_possible : null,
          types: a.submission_types ?? [],
          url: linkOnMyEtl(a.html_url),
          isQuiz: Boolean(a.is_quiz_assignment || a.is_quiz_lti_assignment || a.quiz_id),
          submittedAt: s.submitted_at ?? null,
          score: typeof s.score === 'number' ? s.score : null,
          late: Boolean(s.late),
          missing: Boolean(s.missing),
          excused: Boolean(s.excused),
          comments: (s.submission_comments ?? []).map((c) => ({
            author: c.author_name ?? c.author?.display_name ?? '',
            text: c.comment ?? '',
            at: c.created_at ?? null,
          })),
        };
      });

    const quizzes = (id) =>
      cached(`quizzes:${id}`, async () => {
        const list = await api.get(`/api/v1/courses/${id}/quizzes?per_page=100`).catch(() => []);
        return new Map(list.map((q) => [String(q.id), { timeLimit: q.time_limit ?? null, attempts: q.allowed_attempts ?? null }]));
      });

    const planner = (from, to) =>
      cached(`planner:${from.getTime()}:${to.getTime()}`, async () => {
        const list = await courses();
        const items = await api.get(`/api/v1/planner/items?start_date=${localDate(from.getTime() - DAY_MS)}&end_date=${localDate(to.getTime() + DAY_MS)}&per_page=100`);
        return toDeadlines(items, [], list).filter((d) => {
          const due = Date.parse(d.due);
          return due >= from.getTime() && due < to.getTime();
        });
      }, SHORT);

    const feedback = () =>
      cached('feedback', async () => toFeedback(await api.get('/api/v1/users/self/activity_stream?only_active_courses=true&per_page=50'), await courses()));

    const me = () => cached('me', async () => toUser(await api.get('/api/v1/users/self')), 60 * 60 * 1000);

    const markRead = (courseId, id) => api.markAnnouncementRead(courseId, id);

    return {
      markRead,
      planner,
      courses,
      course,
      today,
      assignments,
      announcements,
      files,
      tabs,
      menu,
      grades,
      modules,
      syllabus,
      assignment,
      quizzes,
      feedback,
      me,
      clear: () => cache.clear(),
    };
  }

  return {
    linkOnMyEtl,
    safeColor,
    daysUntil,
    dDayLabel,
    cleanCourseName,
    currentTermOnly,
    toCourses,
    toDeadlines,
    toFeedback,
    toUser,
    initialsOf,
    splitDeadlines,
    groupByDay,
    toAnnouncements,
    toAssignments,
    toFiles,
    toModuleFiles,
    toGrades,
    toModules,
    frameSrc,
    localDate,
    formatSize,
    fileKind,
    toMenu,
    availableSections,
    boardTabs,
    createStore,
  };
})();

if (typeof module === 'object') module.exports = NeoData;
