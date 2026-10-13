const NeoUI = (() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function t(key, substitutions) {
    return chrome.i18n.getMessage(key, substitutions) || key;
  }

  function locale() {
    return chrome.i18n.getUILanguage();
  }

  function h(tag, props, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props ?? {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else node.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of children.flat(Infinity)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : String(child));
    }
    return node;
  }

  const SYSTEM_SYMBOLS = {
    file: 'doc',
    fileText: 'doc.text',
    fileArchive: 'doc.zipper',
    fileSlides: 'doc.richtext',
    fileSheet: 'tablecells',
    doc: 'doc.text',
    assignment: 'square.and.pencil',
    quiz: 'questionmark.circle',
    chat: 'bubble.left',
    play: 'play.circle',
    external: 'arrow.up.right',
    download: 'arrow.down.to.line',
    check: 'checkmark',
  };
  const applePlatform = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  let symbolsAvailable = false;
  const bundled = (path) => fetch(chrome.runtime.getURL(path)).then((response) => response.ok, () => false);
  const assetsChecked = Promise.all([
    applePlatform && bundled('icons/symbols/checkmark.png'),
    bundled('fonts/Compagnon-Roman.woff2'),
  ]).then(([symbols, fonts]) => {
    symbolsAvailable = symbols;
    NeoThemes.setSignatureFonts(fonts);
  });

  const ICONS = {
    home: ['M3.5 9.5 10 4l6.5 5.5', 'M5.5 8v8.5h9V8', 'M8.5 16.5v-4h3v4'],
    classic: ['M8 6 4.5 9.5 8 13', 'M5 9.5h7a3.5 3.5 0 0 1 0 7h-1'],
    refresh: ['M15.5 10a5.5 5.5 0 1 1-1.6-3.9', 'M15.5 4v3.5H12'],
    external: ['M8 5h7v7', 'M15 5 6 14'],
    check: ['M5 10.5 8.5 14 15 6.5'],
    sidebar: ['M3.5 4.5h13v11h-13z', 'M8 4.5v11'],
    back: ['M12 5 7 10l5 5'],
    file: ['M4.5 2.5h7L15.5 6.5v11h-11z', 'M11.5 2.5v4h4'],
    fileText: ['M4.5 2.5h7L15.5 6.5v11h-11z', 'M11.5 2.5v4h4', 'M7 10h6', 'M7 13h6'],
    fileArchive: ['M4.5 2.5h11v15h-11z', 'M10 3v2h2v2h-2v2h2v2h-2', 'M9 12h3v3H9z'],
    fileSlides: ['M3 4h14v10H3z', 'M10 14v3', 'M7 17h6', 'M6 10l2.5-3 2 2 3-3'],
    fileSheet: ['M4 3h12v14H4z', 'M4 7h12', 'M4 11h12', 'M8 7v10'],
    doc: ['M4 2.5h12v15H4z', 'M7 6.5h6', 'M7 10h6', 'M7 13.5h4'],
    list: ['M7.5 6h8', 'M7.5 10h8', 'M7.5 14h8', 'M4.5 6h.01', 'M4.5 10h.01', 'M4.5 14h.01'],
    megaphone: ['M4 8.5v3h2.5L12 15V5L6.5 8.5z', 'M14.5 7.5a3 3 0 0 1 0 5'],
    calendar: ['M4 5.5h12v10.5H4z', 'M4 8.5h12', 'M7 3.5v3', 'M13 3.5v3'],
    palette: ['M10 3.5a6.5 6.5 0 1 0 0 13c1 0 1.5-.6 1.5-1.4 0-1.2-1-1.6-1-2.6 0-.8.7-1.5 1.5-1.5h1.5a3 3 0 0 0 3-3c0-2.6-2.9-4.5-6.5-4.5z', 'M6.5 9.5h.01', 'M8.5 6.5h.01', 'M12 6.5h.01'],
    image: ['M3.5 5h13v10h-13z', 'M3.5 13l4-4 3 3 2-2 4 4', 'M13 8h.01'],
    plus: ['M10 4.5v11', 'M4.5 10h11'],
    close: ['M5.5 5.5l9 9', 'M14.5 5.5l-9 9'],
    copy: ['M7.5 7.5h8v8h-8z', 'M4.5 12.5v-8h8'],
    quiz: ['M10 16.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z', 'M8 8a2 2 0 1 1 2.5 1.9c-.3.1-.5.4-.5.7v.9', 'M10 13.5h.01'],
    chat: ['M4 5h12v8H9l-3.5 3v-3H4z'],
    play: ['M10 16.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z', 'M8.5 7.5l4 2.5-4 2.5z'],
    download: ['M10 4v9', 'M6 9.5l4 4 4-4', 'M5 16.5h10'],
    note: ['M5 3.5h10v13H5z', 'M7.5 7h5', 'M7.5 10h5', 'M7.5 13h3'],
    bell: ['M6 13.5V9a4 4 0 0 1 8 0v4.5l1.5 1.5h-11z', 'M8.5 16.5a1.5 1.5 0 0 0 3 0'],
    folder: ['M3.5 6V15.5h13V7.5H10L8.5 5.5h-5z'],
    layers: ['M10 3.5l6.5 3.5-6.5 3.5L3.5 7z', 'M3.5 10.5l6.5 3.5 6.5-3.5', 'M3.5 13.5l6.5 3.5 6.5-3.5'],
    inbox: ['M3.5 11.5l2-6.5h9l2 6.5v4h-13z', 'M3.5 11.5h4l1 2h3l1-2h4'],
    more: ['M9 5a1 1 0 1 0 2 0a1 1 0 1 0-2 0', 'M9 10a1 1 0 1 0 2 0a1 1 0 1 0-2 0', 'M9 15a1 1 0 1 0 2 0a1 1 0 1 0-2 0'],
    chev: ['M8 5l5 5-5 5'],
    chevLeft: ['M12 5l-5 5 5 5'],
    chevDown: ['M5 8l5 5 5-5'],
    arrowLeft: ['M16 10H4', 'M8.5 5.5 4 10l4.5 4.5'],
    arrowRight: ['M4 10h12', 'M11.5 5.5 16 10l-4.5 4.5'],
    assignment: ['M13.5 9V3.5h-9v13h4', 'M6.5 7h5', 'M6.5 10h3', 'M11 16.5l.4-2 4.2-4.2 1.6 1.6-4.2 4.2z'],
    gear: ['M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M10 2.8v2', 'M10 15.2v2', 'M2.8 10h2', 'M15.2 10h2', 'M4.9 4.9l1.4 1.4', 'M13.7 13.7l1.4 1.4', 'M4.9 15.1l1.4-1.4', 'M13.7 6.3l1.4-1.4'],
    keyboard: ['M3 5.5h14v9H3z', 'M6 8.5h.01', 'M9 8.5h.01', 'M12 8.5h.01', 'M14 8.5h.01', 'M6.5 11.5h7'],
  };

  function icon(name, className = 'icon') {
    const symbol = SYSTEM_SYMBOLS[name];
    if (symbolsAvailable && symbol) {
      return h('span', {
        class: `${className} sf-symbol`,
        'aria-hidden': 'true',
        dataset: { symbol },
        style: `--symbol: url("${chrome.runtime.getURL(`icons/symbols/${symbol}.png`)}")`,
      });
    }
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    for (const d of ICONS[name] ?? []) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    }
    return svg;
  }

  function format(iso, options) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale(), options).format(date);
  }

  const formatTime = (iso) => format(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

  function formatMd(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '' : `${date.getMonth() + 1}/${date.getDate()}`;
  }

  function relative(iso, now = new Date()) {
    if (!iso) return '';
    const ms = new Date(iso).getTime() - now.getTime();
    if (Number.isNaN(ms)) return '';
    const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
    const minutes = Math.round(ms / 60000);
    if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
    const hours = Math.round(ms / 3600000);
    if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
    return rtf.format(Math.round(ms / 86400000), 'day');
  }

  const formatMdTime = (iso) => (iso && !Number.isNaN(new Date(iso).getTime()) ? `${formatMd(iso)} ${formatTime(iso)}` : '');

  const formatMonth = (iso) => format(iso, { year: 'numeric', month: 'long' });
  const formatDay = (iso) => format(iso, { month: 'long', day: 'numeric', weekday: 'long' });
  const formatShortDate = (iso) => format(iso, { month: 'short', day: 'numeric' });
  const formatDateTime = (iso) => format(iso, { month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' });

  function dayHeading(days, iso) {
    if (days === 0) return t('today');
    if (days === 1) return t('tomorrow');
    return formatDay(iso);
  }

  return { t, h, icon, assetsChecked, formatTime, formatMd, formatMdTime, formatMonth, relative, formatDay, formatShortDate, formatDateTime, dayHeading };
})();
