const NeoGuard = (() => {
  const ORIGIN = 'https://myetl.snu.ac.kr';

  const BLOCKED_PATH_PARTS = [
    '/quizzes',
    '/take',
    '/exam',
    '/assessment',
    '/external_tools',
    '/lti',
    '/learningx',

    '/lockdown',
    '/respondus',
    '/proctor',
  ];

  const CHECK_FIRST_PATH_PARTS = ['/assignments/', '/modules/items/'];

  const EXAM_SELECTORS = [
    '#submit_quiz_form',
    '#quiz_show',
    '#quiz_form',
    '#quiz-taking',
    '#quiz-instructions',
    '.quiz-header',
    '#take_quiz_link',
    'form[data-tool-id="Quizzes 2"]',
    'iframe#tool_content',
    'iframe.tool_launch',
    'iframe[src*="external_tools"]',
    'iframe[src*="lti"]',
    'iframe[src*="quiz"]',
    'iframe[src*="exam"]',
    'form[action*="external_tools"]',
    'form[action*="lti"]',
  ];

  function pathOf(url) {
    try {
      const u = new URL(url);
      return u.origin === ORIGIN ? u.pathname.toLowerCase() : null;
    } catch {
      return null;
    }
  }

  function isBlockedUrl(url) {
    const path = pathOf(url);
    return path === null || BLOCKED_PATH_PARTS.some((part) => path.includes(part));
  }

  function needsDomCheck(url) {
    const path = pathOf(url);
    return path === null || CHECK_FIRST_PATH_PARTS.some((part) => path.includes(part));
  }

  function hasExamContent(doc) {
    return EXAM_SELECTORS.some((selector) => doc.querySelector(selector) !== null);
  }

  function isPaused(settings, now = Date.now()) {
    return !settings.enabled || settings.pausedUntil > now;
  }

  const EXAM_PATH_PARTS = ['quiz', 'exam', '/take', 'assessment', 'lockdown', 'respondus', 'proctor'];
  const QUIZ_SELECTORS = ['#submit_quiz_form', '#quiz_show', '#quiz_form', '#quiz-taking', '#take_quiz_link', 'form[data-tool-id="Quizzes 2"]'];

  function isExamUrl(url) {
    try {
      const path = new URL(url).pathname.toLowerCase();
      return EXAM_PATH_PARTS.some((part) => path.includes(part));
    } catch {
      return false;
    }
  }

  function hasQuizContent(doc) {
    return QUIZ_SELECTORS.some((selector) => doc.querySelector(selector) !== null);
  }

  return { ORIGIN, EXAM_SELECTORS, QUIZ_SELECTORS, isBlockedUrl, needsDomCheck, hasExamContent, isPaused, isExamUrl, hasQuizContent };
})();

if (typeof module === 'object') module.exports = NeoGuard;
