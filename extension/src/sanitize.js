const NeoSanitize = (() => {
  const ORIGIN = 'https://myetl.snu.ac.kr';

  const ALLOWED = {
    a: ['href', 'title'],
    abbr: ['title'],
    b: [],
    blockquote: [],
    br: [],
    caption: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    figcaption: [],
    figure: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    hr: [],
    i: [],
    img: ['src', 'alt', 'width', 'height'],
    li: [],
    ol: ['start'],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    strong: [],
    sub: [],
    sup: [],
    table: [],
    tbody: [],
    td: ['colspan', 'rowspan'],
    tfoot: [],
    th: ['colspan', 'rowspan', 'scope'],
    thead: [],
    tr: [],
    u: [],
    ul: [],
  };

  const DROP = new Set([
    'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'template', 'noscript',
    'form', 'input', 'button', 'select', 'textarea', 'link', 'meta', 'base', 'svg', 'math', 'video', 'audio', 'canvas',
  ]);

  function safeHref(value) {
    if (String(value).trim().startsWith('#')) return null;
    try {
      const url = new URL(value, ORIGIN);
      return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function safeImageSrc(value) {
    try {
      const url = new URL(value, ORIGIN);
      return url.origin === ORIGIN ? url.href : null;
    } catch {
      return null;
    }
  }

  function copyChildren(from, to, doc) {
    for (const child of from.childNodes) {
      if (child.nodeType === 3) {
        to.append(doc.createTextNode(child.nodeValue));
      } else if (child.nodeType === 1) {
        const tag = child.localName;
        if (DROP.has(tag)) continue;
        const allowed = ALLOWED[tag];
        if (!allowed) {
          copyChildren(child, to, doc);
          continue;
        }
        const el = doc.createElement(tag);
        for (const name of allowed) {
          const value = child.getAttribute(name);
          if (value === null) continue;
          if (name === 'href') {
            const href = safeHref(value);
            if (!href) continue;
            el.setAttribute('href', href);
            if (new URL(href).origin !== ORIGIN) {
              el.setAttribute('target', '_blank');
              el.setAttribute('rel', 'noopener noreferrer');
            }
          } else if (name === 'src') {
            const src = safeImageSrc(value);
            if (src) el.setAttribute('src', src);
          } else {
            el.setAttribute(name, value);
          }
        }
        if (tag === 'img' && !el.hasAttribute('src')) {
          const alt = child.getAttribute('alt');
          if (alt) to.append(doc.createTextNode(`[${alt}]`));
          continue;
        }
        if (tag === 'img') el.setAttribute('loading', 'lazy');
        copyChildren(child, el, doc);
        to.append(el);
      }
    }
  }

  function sanitize(html, doc) {
    const parsed = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
    const fragment = doc.createDocumentFragment();
    copyChildren(parsed.body, fragment, doc);
    return fragment;
  }

  function toText(html) {
    const parsed = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
    for (const node of parsed.body.querySelectorAll('script, style')) node.remove();
    return (parsed.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  return { sanitize, toText };
})();

if (typeof module === 'object') module.exports = NeoSanitize;
