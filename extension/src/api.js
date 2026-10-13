const NeoApi = (() => {
  const ORIGIN = 'https://myetl.snu.ac.kr';
  const TIMEOUT_MS = 15000;
  const MAX_PAGES = 10;
  const RETRY_DELAY_MS = 800;

  function parseJson(text) {
    return JSON.parse(text.replace(/^while\(1\);/, ''));
  }

  function nextLink(linkHeader) {
    if (!linkHeader) return null;
    for (const part of linkHeader.split(',')) {
      const match = part.match(/<([^>]+)>\s*;\s*rel="next"/);
      if (match) return match[1];
    }
    return null;
  }

  function sameOriginUrl(pathOrUrl) {
    const url = new URL(pathOrUrl, ORIGIN);
    if (url.origin !== ORIGIN) throw new Error(`Refusing to contact ${url.origin}`);
    return url.href;
  }

  function requestError(status, body, url) {
    const error = new Error(`myETL returned ${status} for ${new URL(url).pathname}`);
    error.status = status;
    error.unauthenticated = status === 401 && /unauthenticated|인증되지 않음/.test(body);
    error.rateLimited = status === 429 || (status === 403 && /rate limit/i.test(body));
    return error;
  }

  const retryable = (error) => error.rateLimited || error.status >= 500;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function fetchJson(url, attempt = 0) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        redirect: 'manual',
        signal: controller.signal,
      });
      if (res.type === 'opaqueredirect') throw Object.assign(new Error('myETL redirected (logged out?)'), { status: 0, unauthenticated: true });
      if (!res.ok) throw requestError(res.status, await res.text().catch(() => ''), url);
      return { data: parseJson(await res.text()), link: res.headers.get('Link') };
    } catch (error) {
      const transient = error.status === undefined ? error.name !== 'AbortError' : retryable(error);
      if (attempt >= (error.rateLimited ? 2 : 1) || !transient) throw error;
    } finally {
      clearTimeout(timer);
    }
    await wait(RETRY_DELAY_MS * (attempt + 1) * (attempt + 1));
    return fetchJson(url, attempt + 1);
  }

  async function get(pathOrUrl) {
    let url = sameOriginUrl(pathOrUrl);
    const items = [];
    for (let page = 0; url && page < MAX_PAGES; page++) {
      const { data, link } = await fetchJson(url);
      if (!Array.isArray(data)) return data;
      items.push(...data);
      const next = nextLink(link);
      url = next && sameOriginUrl(next) !== url ? sameOriginUrl(next) : null;
    }
    return items;
  }

  function csrfToken() {
    const match = /(?:^|;\s*)_csrf_token=([^;]+)/.exec(document.cookie);
    return match ? decodeURIComponent(match[1]) : '';
  }

  async function markAnnouncementRead(courseId, topicId) {
    if (!/^\d+$/.test(String(courseId)) || !/^\d+$/.test(String(topicId))) throw new Error('Invalid announcement');
    const url = sameOriginUrl(`/api/v1/courses/${courseId}/discussion_topics/${topicId}/read`);
    const res = await fetch(url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'X-CSRF-Token': csrfToken(), 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
    });
    if (!res.ok) throw requestError(res.status, await res.text().catch(() => ''), url);
  }

  return { ORIGIN, get, markAnnouncementRead, parseJson, nextLink, sameOriginUrl, requestError };
})();

if (typeof module === 'object') module.exports = NeoApi;
