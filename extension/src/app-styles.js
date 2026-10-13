const NEO_APP_CSS = `
:host {
  all: initial;
  position: fixed;
  inset: 0;
  z-index: 2147483000;

  --bg: #FFFFFF;
  --surface: #FFFFFF;
  --fill: #F3F5F7;
  --border: #E2E6EB;
  --text: #293545;
  --text2: #657184;
  --title: #293545;
  --accent: #1A2D56;
  --on-accent: #FFFFFF;
  --date: #1A2D56;
  --danger: #D0021B;
  --warn: #B4570B;
  --sidebar: #1A2D56;
  --sidebar-text: #FFFFFF;
  --sidebar-active: #FFFFFF;
  --sidebar-active-text: #1A2D56;
  --wallpaper: none;
  --font: "Neo Compagnon", "Neo NanumSquare", -apple-system, "Neo Pretendard", sans-serif;
  --font-title: "Neo Marcellus", "Neo NanumSquare", -apple-system, "Neo Pretendard", sans-serif;
  --font-ko: "Neo Compagnon Letters", "Neo NanumSquare", -apple-system, "Neo Pretendard", sans-serif;

  --radius-small: 4px;
  --radius-control: 8px;
  --radius-panel: 12px;
  --radius-dialog: 16px;
  --line: var(--border);
  --raise: color-mix(in srgb, var(--text) 24%, var(--surface));
  --hover: color-mix(in srgb, var(--fill) 85%, transparent);
  --accent-soft: color-mix(in srgb, var(--accent) 10%, var(--surface));
  --link: color-mix(in srgb, var(--accent) 80%, var(--text));
  --shadow: 0 1px 3px rgba(26, 45, 86, 0.10);
  --side-raise: rgba(0, 0, 0, 0.22);

  font: 14px/1.5 var(--font);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  font-synthesis: none;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
}

:host([data-mode="dark"]) {
  --link: color-mix(in srgb, var(--accent) 75%, #FFFFFF);
  --raise: color-mix(in srgb, #000000 55%, var(--surface));
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 14px rgba(0, 0, 0, 0.3);
  --side-raise: rgba(0, 0, 0, 0.45);
}

*, *::before, *::after { box-sizing: border-box; }

.app {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font: 14px/1.5 var(--font);
  scrollbar-color: color-mix(in srgb, var(--text) 22%, transparent) transparent;
}

:host([data-personal-font]) .app,
:host([data-personal-font]) .sheet { font-size-adjust: 0.43; }
:host([data-personal-font]) h1,
:host([data-personal-font]) .reader-title,
:host([data-personal-font]) .tracker h2,
:host([data-personal-font]) .feedback h2,
:host([data-personal-font]) .sheet h2 { font-family: var(--font-title); font-weight: 400; font-size-adjust: none; }
:host([data-personal-font]) .title:lang(ko) { font-family: var(--font-ko); }
:host([data-personal-font]) .prose { font-size: 17px; font-size-adjust: 0.43; }
:host([data-personal-font]) .prose:lang(ko) { font-family: var(--font-ko); font-size-adjust: 0.48; }
:host([data-personal-font]) .prose code,
:host([data-personal-font]) .prose pre { font-family: "Neo Sligoil", "SF Mono", Menlo, monospace; font-size-adjust: 0.43; }

.app::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--wallpaper);
  background-size: cover;
  background-position: center;
  pointer-events: none;
}

.sidebar, .content { position: relative; z-index: 1; }

a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--radius-small); }

.icon {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sf-symbol {
  display: inline-block;
  background: currentColor;
  -webkit-mask: var(--symbol) center / contain no-repeat;
  mask: var(--symbol) center / contain no-repeat;
}

.raised {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--surface);
  box-shadow: 0 2px 0 var(--raise);
  color: var(--text);
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: transform 80ms ease, box-shadow 80ms ease;
}

.raised:hover { background: color-mix(in srgb, var(--fill) 70%, var(--surface)); }
.raised:active { transform: translateY(2px); box-shadow: 0 0 0 var(--raise); }
.raised[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.raised.wide { width: 100%; height: 40px; font-size: 14px; }
.raised.small { height: 28px; padding: 0 9px; border-radius: var(--radius-control); font-size: 12.5px; }
.raised .icon { width: 15px; height: 15px; }

:host([data-glass]) .sidebar,
:host([data-glass]) .panel,
:host([data-glass]) .card,
:host([data-glass]) .topbar {
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
}

.sidebar {
  width: 216px;
  flex: none;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  background: var(--sidebar);
  color: var(--sidebar-text);
  overflow-y: auto;
}

.side-top { display: flex; align-items: center; padding-bottom: 16px; }
.sidebar nav { display: flex; flex-direction: column; gap: 4px; }
.sidebar :focus-visible { outline-color: var(--sidebar-text); }

.emblem {
  display: block;
  flex: none;
  width: 100%;
  aspect-ratio: 2116 / 2195;
  background: currentColor;
  -webkit-mask: var(--emblem) center / contain no-repeat;
  mask: var(--emblem) center / contain no-repeat;
}

.avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.avatar img { width: 100%; height: 100%; object-fit: cover; }

.brand-button {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
}

.brand-button .icon { width: 16px; height: 16px; }

.sidebar-label {
  margin: 20px 10px 8px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0.72;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--radius-control);
  background: none;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-align: left;
}

.item:hover { background: color-mix(in srgb, var(--sidebar-text) 12%, transparent); }
.item[aria-current="page"] {
  background: var(--sidebar-active);
  box-shadow: 0 2px 0 var(--side-raise);
  color: var(--sidebar-active-text);
}
.item .name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item .icon { width: 18px; height: 18px; }
.item .chev { width: 13px; height: 13px; opacity: 0.65; }

.dot {
  width: 18px;
  height: 18px;
  flex: none;
  padding: 1.5px;
  border: 1.5px solid var(--c, currentColor);
  border-radius: 6px;
  background: var(--c, currentColor);
  background-clip: content-box;
}

.mini {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--c, var(--text2));
}

.sidebar-foot { display: flex; align-items: center; gap: 6px; flex: none; margin-top: auto; padding-top: 12px; border-top: 1px solid color-mix(in srgb, var(--sidebar-text) 12%, transparent); }
.sidebar nav:last-of-type { padding-bottom: 24px; }

.foot-button {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 6px;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
}
.foot-button .icon { width: 14px; height: 14px; }

.sidebar-foot > a, .sidebar-foot > button {
  border: 1px solid #E2E6EB;
  border-radius: var(--radius-control);
  background: #FFFFFF;
  color: #293545;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.sidebar-foot .foot-button { font-size: 13px; }
.sidebar-foot > a:hover, .sidebar-foot > button:hover { background: #F3F5F7; border-color: #D0D7E1; }
.sidebar-foot > a:active, .sidebar-foot > button:active { background: #E9EDF2; }

.content { flex: 1; min-width: 0; overflow-y: auto; scrollbar-gutter: stable both-edges; overflow-anchor: none; }
.topbar { display: none; }

.page { padding: 32px 40px 64px; container: page / inline-size; }

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 55px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.25;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--title);
}

.head-sub { margin: 4px 0 0; font-size: 13px; color: var(--text2); }
.head-tools { position: relative; display: flex; align-items: center; gap: 8px; }

.kebab, .tool {
  display: inline-grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  min-width: 32px;
  padding: 0 6px;
  border: 0;
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--text);
  font-size: 13px;
}

.kebab .icon { width: 18px; height: 18px; stroke-width: 2.2; }
.kebab:hover, .tool:hover { background: var(--hover); }
.tool.small { height: 26px; min-width: 26px; padding: 0 4px; color: var(--text2); }
.tool.small .icon { width: 14px; height: 14px; }

.menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 4;
  min-width: 210px;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius-panel);
  background: var(--surface);
  box-shadow: 0 14px 34px -10px rgba(0, 0, 0, 0.3);
}

:host([data-glass]) .menu { background: var(--bg); }

.menu button, .menu a {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--radius-control);
  background: none;
  font-size: 13.5px;
  text-align: left;
  color: var(--text);
}

.menu button:hover, .menu a:hover { background: var(--hover); }

.dash { display: grid; gap: 32px; align-items: start; }
.dash-main { min-width: 0; container: courses / inline-size; }

@container page (min-width: 860px) {
  .dash { grid-template-columns: minmax(0, 1fr) 280px; }
}

.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 262px), 1fr)); gap: 16px; }
@container courses (min-width: 822px) {
  .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--radius-control);
  background: var(--surface);
  box-shadow: var(--shadow), 0 0 0 1px color-mix(in srgb, var(--border) 70%, transparent);
}

.card-hero {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-control) var(--radius-control) 0 0;
  background: var(--card-bg, var(--accent));
}

.card-hero > a.cover-link { position: absolute; inset: 0; border-radius: inherit; }

.card-menu-btn {
  position: absolute;
  right: 10px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-control);
  background: #FFFFFF;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  color: #293545;
}

.card-menu-btn:active { transform: translateY(2px); box-shadow: none; }

.card .menu-wrap { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; }
.card-menu-btn { top: 0; right: 0; opacity: 0; transition: opacity 120ms; }
.card:hover .card-menu-btn, .card:focus-within .card-menu-btn, .card-hero:has(.menu) .card-menu-btn { opacity: 1; }
.card .menu { top: 50px; right: 10px; }

.card-body { display: flex; flex: 1; flex-direction: column; padding: 16px; }

.card-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-name, var(--link));
}

.card-name:hover { text-decoration: underline; }
.card-code { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px; font-size: 13px; color: var(--text2); font-variant-numeric: tabular-nums; }

.card-icons { display: flex; justify-content: space-between; padding: 20px 0 12px; }
.card-icons a { display: grid; place-items: center; width: 34px; height: 32px; border-radius: var(--radius-small); color: var(--text); }
.card-icons a:hover { background: var(--hover); color: var(--text); }
.card-icons .icon { width: 22px; height: 22px; stroke-width: 1.4; }

.card-due h3 { margin: 2px 0 10px; font-size: 16px; font-weight: 500; }

.due-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 13.5px;
  line-height: 1.35;
  color: var(--text2);
}

.due-row .t { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text2); }
a.t:hover { color: var(--text); text-decoration: underline; }
.due-row .d { flex: none; font-size: 12.5px; font-variant-numeric: tabular-nums; }
.due-row.late .t, .due-row.late .d { color: var(--danger); }
.due-row.done .t, .due-row.done .d { text-decoration: line-through; opacity: 0.75; }
.due-none { margin: 0; padding: 2px 0; font-size: 13.5px; color: var(--text2); }

.cards.condensed { grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 16px; }
.cards.condensed .card { max-width: 320px; }
.cards.condensed .card-icons, .cards.condensed .card-due { display: none; }

.check {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex: none;
  padding: 0;
  border: 1.5px solid var(--c, color-mix(in srgb, var(--text) 45%, transparent));
  border-radius: 50%;
  background: transparent;
  color: transparent;
}

.check .icon { width: 12px; height: 12px; stroke-width: 2.6; }
.check:hover { color: color-mix(in srgb, var(--c, var(--accent)) 60%, transparent); }
.check[aria-pressed="true"] { border-color: var(--c, var(--accent)); background: var(--c, var(--accent)); color: #FFFFFF; }
.check:disabled { cursor: default; }
.check.small { width: 14px; height: 14px; border-width: 1.3px; }
.check.small .icon { width: 9px; height: 9px; }

.dashboard-side, .tracker, .tracker-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.tracker-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
.tracker h2, .feedback h2 { margin: 0; font-size: 18px; font-weight: 400; color: var(--title); }
.tracker-head .actions { display: flex; align-items: center; gap: 6px; }

.range { display: flex; align-items: center; gap: 4px; }

.period {
  height: 30px;
  margin-right: auto;
  padding: 0 28px 0 10px;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--surface) no-repeat right 9px center / 11px;
  color: var(--text);
  font-size: 13px;
  font-weight: 400;
  appearance: none;
  cursor: pointer;
}

.period-wrap { position: relative; margin-right: auto; display: inline-flex; align-items: center; }
.period-wrap .icon { position: absolute; right: 9px; width: 12px; height: 12px; pointer-events: none; color: var(--text2); }
.period-wrap .period { margin: 0; }
.range-label { font-size: 13px; color: var(--text2); white-space: nowrap; font-variant-numeric: tabular-nums; }

.arrow { display: grid; place-items: center; width: 26px; height: 28px; padding: 0; border: 0; border-radius: var(--radius-control); background: none; color: var(--text); }
.arrow:hover { background: var(--hover); }

.rings { position: relative; display: grid; place-items: center; padding: 4px 0; }
.rings svg { width: 200px; height: 200px; }
.rings .center { position: absolute; display: grid; place-items: center; text-align: center; line-height: 1.2; }
.rings .center b { font-size: 26px; font-weight: 500; font-variant-numeric: tabular-nums; }
.rings .center span { font-size: 13px; color: var(--text2); font-variant-numeric: tabular-nums; }

.legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px 4px; }
.legend button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  padding: 2px 6px;
  border: 0;
  border-radius: var(--radius-small);
  background: none;
  color: var(--text);
  font-size: 12.5px;
}

.legend button:hover { background: var(--hover); }
.legend button[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
.legend button span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.seg {
  display: flex;
  gap: 2px;
  padding: 4px;
  border-radius: var(--radius-panel);
  background: var(--fill);
}

.seg button, .seg a {
  display: grid;
  flex: 1;
  place-items: center;
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--radius-control);
  background: none;
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
}

.seg button:hover, .seg a:hover { color: var(--text); }
.seg [aria-pressed="true"], .seg [aria-current="page"] { background: var(--surface); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), 0 1px 0 var(--raise); color: var(--text); font-weight: 600; }
.seg .icon { width: 17px; height: 17px; }

.tracker .tabs { gap: 0; padding: 4px 0; border-radius: 0; background: none; }
.tracker .tabs button { height: 36px; border-radius: var(--radius-small); color: var(--text2); }
.tracker .tabs button:hover { background: var(--hover); }
.tracker .tabs [aria-pressed="true"] { background: none; box-shadow: none; color: var(--text); }
.tracker .tabs .icon { width: 20px; height: 20px; }

details.group + details.group { margin-top: 12px; }

details.group summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px 8px;
  list-style: none;
  color: var(--text2);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  cursor: pointer;
}

details.group summary::-webkit-details-marker { display: none; }
details.group summary .label { flex: 1; }
details.group summary .icon { width: 14px; height: 14px; transition: transform 150ms; }
details.group:not([open]) summary .icon { transform: rotate(-90deg); }
details.group.late summary { color: var(--danger); }

.count {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  border-radius: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: inherit;
  opacity: 0.75;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.group-items { display: flex; flex-direction: column; gap: 8px; }

.no-tasks { display: flex; align-items: center; gap: 8px; padding: 2px 2px 10px; border-bottom: 1px solid var(--line); color: var(--text2); font-size: 12px; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase; }

.track-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2px 8px;
  padding: 8px 10px 9px 12px;
  border: 1px solid var(--line);
  border-left: 5px solid var(--c, var(--accent));
  border-radius: var(--radius-control);
  background: var(--surface);
}

.track-item:hover { border-color: color-mix(in srgb, var(--c, var(--accent)) 55%, var(--line)); border-left-color: var(--c, var(--accent)); }
.track-item .check { grid-column: 2; grid-row: 1; }
.ti-main { display: block; min-width: 0; grid-column: 1; grid-row: 1 / span 2; }
.ti-course { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--text2); }
.ti-title { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 600; line-height: 1.4; }
a.ti-main:hover .ti-title { text-decoration: underline; }
.ti-due { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font-size: 12px; font-weight: 400; color: var(--text2); font-variant-numeric: tabular-nums; }
.ti-due .urgent, .ti-due .late { color: var(--danger); }
.ti-due .pts { font-weight: 500; }
.track-item.done .ti-title { color: var(--text2); text-decoration: line-through; }

.news-item { display: block; padding: 8px 10px 9px 12px; border: 1px solid var(--line); border-left: 5px solid var(--c, var(--accent)); border-radius: var(--radius-control); background: var(--surface); }
.news-item:hover .ti-title { text-decoration: underline; }
.news-item .ti-title { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.news-item .ti-due { justify-content: flex-start; font-weight: 500; }

.feedback { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.feedback h2 { padding-bottom: 8px; border-bottom: 1px solid var(--line); }
.dash-main > .page-head,
.dashboard-side > .feedback > h2 {
  height: 56px;
  min-height: 56px;
  padding-bottom: 12px;
}
.dash-main > .page-head h1 { font-size: 28px; line-height: 36px; }
.dashboard-side > .feedback { margin-top: 0; }
.dashboard-side > .feedback > h2 { display: flex; align-items: center; font-size: 20px; line-height: 36px; }
.fb-item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0 10px; padding: 8px 2px; }
.fb-item > .icon { width: 16px; height: 16px; margin-top: 2px; color: var(--text2); }
.fb-title { color: var(--text); font-size: 13.5px; text-decoration: underline; text-decoration-color: color-mix(in srgb, currentColor 35%, transparent); text-underline-offset: 2px; overflow-wrap: anywhere; }
a.fb-title:hover { text-decoration-color: currentColor; }
.fb-meta { display: block; font-size: 12px; color: var(--text2); }
.fb-comment { display: block; margin-top: 2px; font-size: 12px; color: var(--text2); font-style: italic; overflow-wrap: anywhere; }

.empty, .loading, .error { margin: 0; padding: 10px 2px; font-size: 13px; color: var(--text2); }
.error { color: var(--danger); }

.course-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.course-nav .seg { flex: none; flex-wrap: wrap; max-width: 100%; }
.course-nav .seg a { flex: none; font-weight: 500; }

.more { display: flex; flex-wrap: wrap; gap: 8px; }

.more-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--surface);
  box-shadow: 0 2px 0 var(--raise);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.more-link:hover { background: color-mix(in srgb, var(--fill) 70%, var(--surface)); }
.more-link:active { transform: translateY(2px); box-shadow: none; }
.more-link.current { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.more-link .icon { width: 12px; height: 12px; color: var(--text2); }

.section + .section { margin-top: 24px; }

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--text2);
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0;
}

.section-title .aside { font-size: 12.5px; font-weight: 500; letter-spacing: 0; text-transform: none; color: var(--text2); }
.section-title.late { color: var(--danger); }

.panel {
  padding: 2px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--surface);
}

.section > .panel:has(> .list) { padding: 0; border: 0; border-radius: 0; background: transparent; }
.section > .panel > .list { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.section > .panel > .list .row { padding: 12px 8px; }
.section > .panel > .list .row > * { padding-top: 0; padding-bottom: 0; }
.section > .panel > .list .row:hover,
.section > .panel > .list .row:focus-within { background: var(--hover); }

.list { margin: 0; padding: 0; list-style: none; }
.list > li + li { border-top: 1px solid var(--border); }

.row { display: grid; grid-template-columns: var(--lead, 56px) minmax(0, 1fr) auto; align-items: center; }
.course-body[data-section="files"] .row,
.course-body[data-section="modules"] .row { --lead: 36px; }
.course-body[data-section="modules"] .panel > .list .row { min-height: 44px; padding-block: 10px; }
.course-body[data-section="modules"] .row > .lead { align-self: start; padding-top: 1px; }
.row > * { padding: 12px 0; }
.row.no-lead { grid-template-columns: minmax(0, 1fr) auto; }
.lead { display: flex; align-items: center; justify-content: center; padding-right: 12px; }
.main { display: block; min-width: 0; }
.title { display: block; font-size: 15px; font-weight: 500; line-height: 24px; overflow-wrap: anywhere; }
a.main:hover .title { text-decoration: underline; text-underline-offset: 2px; }

.meta { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; margin-top: 4px; font-size: 12.5px; color: var(--text2); }
.meta .date { font-variant-numeric: tabular-nums; }
.row .meta { margin-top: 2px; font-size: 13px; line-height: 20px; }

.trail { display: flex; align-items: center; gap: 6px; padding-left: 14px; font-size: 13px; color: var(--text2); white-space: nowrap; font-variant-numeric: tabular-nums; }
.trail .icon { width: 14px; height: 14px; }
.trail .go { opacity: 0; transition: opacity 120ms; }
.row:hover .trail .go, .row:focus-within .trail .go { opacity: 1; }
.trail-inner { display: inline-flex; align-items: center; gap: 6px; }
.trail-inner.score { color: var(--text); font-weight: 600; }
.trail-inner.late { color: var(--danger); font-weight: 600; }

.done .title { color: var(--text2); text-decoration: line-through; }

.pill { font-size: 12.5px; font-weight: 600; color: var(--text2); white-space: nowrap; font-variant-numeric: tabular-nums; }
.pill.soon { color: var(--danger); font-weight: 700; }
.pill.late { color: var(--danger); }
.pill.time { color: var(--text2); }
.pill.time.soon { color: var(--danger); }

.unread-dot { display: inline-block; width: 8px; height: 8px; margin-right: 7px; border-radius: 50%; background: var(--danger); vertical-align: 1px; }

.kind { display: inline-flex; align-items: center; justify-content: center; color: var(--text2); }
.kind .icon { width: 22px; height: 22px; stroke-width: 1.7; }

.columns { display: grid; gap: 24px 32px; }
@container (min-width: 780px) { .columns { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); } }
.stack > .section:first-child { margin-top: 0; }

.split { display: grid; grid-template-columns: minmax(250px, 330px) minmax(0, 1fr); gap: 16px; align-items: start; }
.split .pane-list { padding: 6px; }
.ann { display: block; padding: 10px 12px; border-radius: var(--radius-control); }
.ann:hover { background: var(--hover); }
.ann[aria-current="true"] { background: var(--accent-soft); }
.ann .title { font-size: 14px; }

.reader { padding: 24px; min-width: 0; }
.reader .back { display: none; margin-bottom: 12px; }
.reader-title { margin: 0; font-size: 22px; line-height: 1.4; font-weight: 600; }
.reader .meta { margin: 8px 0 24px; }

.prose { font-size: 15px; line-height: 1.75; overflow-wrap: anywhere; }
.prose > :first-child { margin-top: 0; }
.prose p, .prose ul, .prose ol, .prose blockquote, .prose pre, .prose table, .prose figure { margin: 0 0 1em; }
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 { margin: 1.4em 0 0.4em; font-size: 17px; line-height: 1.4; }
.prose a { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; }
:host([data-mode="dark"]) .prose a { color: color-mix(in srgb, var(--accent) 70%, #FFFFFF); }
.prose img { max-width: 100%; height: auto; border-radius: var(--radius-small); }
.prose blockquote { padding-left: 14px; border-left: 3px solid var(--border); color: var(--text2); }
.prose pre, .prose code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px; }
.prose pre { padding: 12px 14px; border-radius: var(--radius-control); background: var(--fill); overflow-x: auto; }
.prose table { border-collapse: collapse; font-size: 14px; }
.prose th, .prose td { padding: 7px 12px; border: 1px solid var(--border); text-align: left; vertical-align: top; }
.prose th { background: var(--hover); }
.prose hr { border: 0; border-top: 1px solid var(--border); margin: 1.6em 0; }

.open-original { margin-top: 24px; }
.open-original.first { max-width: 100%; min-height: 34px; height: auto; margin: 0 0 18px; padding: 6px 12px; white-space: normal; text-align: left; }
.syllabus-link-only { display: flex; align-items: center; justify-content: flex-start; min-height: 96px; }
.syllabus-link-only .open-original { margin: 0; }

@container (max-width: 640px) {
  .split { grid-template-columns: minmax(0, 1fr); }
  .split.reading .pane-list { display: none; }
  .split:not(.reading) .reader { display: none; }
  .reader { padding: 18px; }
  .reader .back { display: inline-flex; }
}

.subheader { padding: 12px 8px; font-size: 12px; font-weight: 700; color: var(--text2); }
.req { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: var(--radius-small); background: var(--fill); font-size: 12px; }
.req .icon { width: 12px; height: 12px; }
.req.done { background: var(--accent-soft); color: var(--accent); }

.grade-total { display: flex; align-items: center; gap: 20px; margin-bottom: 22px; padding: 18px 22px; }
.grade-number { font-size: 38px; font-weight: 700; color: var(--title); font-variant-numeric: tabular-nums; }

.tool-frame { display: block; width: 100%; height: calc(100vh - 250px); min-height: 560px; border: 1px solid var(--line); border-radius: var(--radius-panel); background: #fff; }

.sheet-backdrop { position: fixed; inset: 0; z-index: 5; display: flex; justify-content: flex-end; background: rgba(15, 20, 30, 0.32); }

.sheet {
  width: min(560px, 100%);
  height: 100%;
  overflow-y: auto;
  padding: 22px 26px 40px;
  background: var(--bg);
  color: var(--text);
  box-shadow: -24px 0 48px -24px rgba(0, 0, 0, 0.45);
}

.sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.sheet h2 { margin: 0; font-size: 24px; font-weight: 600; color: var(--title); }
.sheet h3 { margin: 24px 0 10px; color: var(--text2); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }

.theme-backdrop { align-items: center; justify-content: center; padding: 24px; }
.theme-sheet { width: min(1120px, 100%); height: min(680px, 100%); display: flex; flex-direction: column; padding: 16px 20px; border-radius: var(--radius-panel); overflow: hidden; box-shadow: 0 20px 80px rgba(0, 0, 0, 0.25); }
.theme-sheet > .sheet-head { flex: none; margin-bottom: 12px; padding-bottom: 12px; }
.theme-sheet > .sheet-head h2 { font-size: 22px; }
.theme-workspace { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 20px; flex: 1; min-height: 0; }
.theme-preview-panel { align-self: start; min-width: 0; padding: 12px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--surface); overflow: auto; }
.theme-sheet .preview-label { margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line); font-size: 13px; font-weight: 600; letter-spacing: 0; text-transform: none; color: var(--text); }
.theme-preview { position: relative; overflow: hidden; width: 100%; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--bg); pointer-events: none; }
.theme-preview-screen { width: 1200px; height: 750px; transform-origin: top left; }
.theme-preview .sidebar { position: relative; inset: auto; transform: none; }
.theme-preview .content { overflow: hidden; }
.theme-preview .topbar { display: none; }
.theme-preview .tracker h2 { font-size: 18px; font-weight: 400; }
.theme-preview .card-due h3 { margin: 2px 0 10px; font-size: 16px; font-weight: 500; letter-spacing: 0; text-transform: none; color: var(--text); }
.theme-controls { min-width: 0; overflow-y: auto; scrollbar-gutter: stable; padding: 2px 4px 12px; }
.theme-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-bottom: 12px; }
.tile { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 40px; padding: 6px 8px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--surface); color: var(--text); text-align: left; }
.tile:hover { background: var(--hover); }
.tile-preview { position: relative; display: flex; flex: none; width: 36px; height: 26px; overflow: hidden; border-radius: var(--radius-small); }
.tile[aria-checked="true"] { border-color: var(--accent); background: var(--accent-soft); }
.tile-side { width: 28%; }
.tile-main { position: relative; flex: 1; padding: 4px; }
.tile-line { display: block; width: 60%; height: 2px; margin-bottom: 3px; border-radius: 1px; }
.tile-cards { display: flex; gap: 2px; }
.tile-cards span { width: 5px; height: 9px; border-radius: 1px; }
.tile-name { display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 500; }
.setting-row { display: grid; grid-template-columns: 84px minmax(0, 1fr); align-items: start; gap: 12px; padding: 12px 0; border-top: 1px solid var(--line); }
.theme-controls .setting-row h3 { margin: 6px 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0; text-transform: none; }
.theme-controls .options { gap: 6px; }
.theme-controls .option { min-height: 30px; height: auto; max-width: 100%; gap: 6px; padding: 4px 8px; font-size: 12px; font-weight: 500; }
.theme-controls .wallpaper-thumb { width: 24px; height: 18px; }
.theme-controls .swatch span { width: 10px; height: 10px; }
.theme-controls .toggle-row { padding: 6px 0; font-size: 13px; }
.theme-controls .color-field { gap: 6px; font-size: 12px; }
.theme-controls .color-field input { width: 28px; height: 28px; }
.theme-more { border-top: 1px solid var(--line); }
.theme-more > summary { display: flex; align-items: center; justify-content: space-between; min-height: 36px; list-style: none; font-size: 13px; cursor: pointer; }
.theme-more > summary::-webkit-details-marker { display: none; }
.theme-more > summary .icon { width: 14px; height: 14px; color: var(--text2); }
.theme-more[open] > summary .icon { transform: rotate(180deg); }
.theme-controls .theme-more h3 { margin: 16px 0 8px; letter-spacing: 0; text-transform: none; }
.theme-controls .css-field { min-height: 80px; padding: 8px; }

.options { display: flex; flex-wrap: wrap; gap: 8px; }
.option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--surface);
  box-shadow: 0 2px 0 var(--raise);
  font-size: 13px;
  font-weight: 600;
}

.option:active { transform: translateY(2px); box-shadow: none; }
.option[aria-checked="true"] { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.swatch { display: inline-flex; }
.swatch span { width: 12px; height: 12px; margin-left: -3px; border: 1.5px solid var(--surface); border-radius: 50%; }
.swatch span:first-child { margin-left: 0; }
.wallpaper-thumb { width: 36px; height: 22px; border-radius: var(--radius-small); background: var(--thumb, var(--fill)); background-size: cover; background-position: center; }
.options.colors { gap: 14px; }
.color-field { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; }
.color-field input { width: 34px; height: 34px; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-control); background: none; }
.custom-builder .options + .options { margin-top: 10px; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 2px; font-size: 14px; cursor: pointer; }

.switch { appearance: none; position: relative; flex: none; width: 40px; height: 24px; margin: 0; border-radius: 999px; background: var(--line); cursor: pointer; transition: background 150ms; }
.switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25); transition: transform 150ms; }
.switch:checked { background: var(--accent); }
.switch:checked::after { transform: translateX(16px); }

.code-row { display: flex; gap: 8px; margin-top: 8px; }
.code-field { flex: 1; min-width: 0; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--surface); color: var(--text); font: 12.5px/1.4 ui-monospace, "SF Mono", Menlo, monospace; }
.css-field { display: block; width: 100%; min-height: 120px; margin-bottom: 10px; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--surface); color: var(--text); font: 12.5px/1.5 ui-monospace, "SF Mono", Menlo, monospace; resize: vertical; }

@media (max-width: 1000px) {
  .theme-backdrop { padding: 16px; }
  .theme-sheet { max-width: 680px; }
  .theme-workspace { grid-template-columns: minmax(0, 1fr); }
  .theme-preview-panel { display: none; }
}

@media (max-width: 560px) {
  .theme-backdrop { padding: 12px; }
  .theme-controls .theme-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .setting-row { grid-template-columns: minmax(0, 1fr); gap: 6px; padding: 10px 0; }
  .theme-controls .setting-row h3 { margin: 0; }
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 6;
  padding: 10px 16px;
  border-radius: var(--radius-control);
  background: var(--text);
  color: var(--bg);
  font-size: 13.5px;
  transform: translateX(-50%);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
}

@media (max-width: 760px) {
  .sidebar { position: fixed; inset: 0 auto 0 0; z-index: 2; transform: translateX(-100%); transition: transform 180ms ease; }
  .app.menu-open .sidebar { transform: none; }
  .topbar { position: sticky; top: 0; z-index: 1; display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: color-mix(in srgb, var(--bg) 90%, transparent); border-bottom: 1px solid var(--line); font-weight: 700; }
  .page { padding: 18px 14px 56px; }
  h1 { font-size: 26px; }
  .dash-main > .page-head h1 { font-size: 26px; }
  .page-head { flex-wrap: wrap; }
  .row { --lead: 48px; }
  .sheet { padding: 18px 16px 32px; }
}
`;
