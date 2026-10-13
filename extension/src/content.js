(async () => {
  const html = document.documentElement;
  const url = location.href;
  if (NeoGuard.isBlockedUrl(url)) return;

  const route = NeoRoutes.parse(url);
  let [settings] = await Promise.all([NeoSettings.load(), NeoUI.assetsChecked]);
  let domChecked = false;
  let examOnPage = false;
  let app = null;
  let resumeTimer = null;

  const active = () => !NeoGuard.isPaused(settings) && !examOnPage;
  const withoutHash = (href) => href.split('#')[0];

  function update(changedKeys = []) {
    const takeover = active() && settings.newInterface && route !== null;
    html.classList.toggle('neo-app-active', takeover);
    if (takeover) {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.style.setProperty('--neo-bg', NeoThemes.resolve(settings.theme, dark, settings.customTheme).bg);
    }

    const darkAllowed = domChecked || !NeoGuard.needsDomCheck(url);
    html.classList.toggle('neo-etl-dark', active() && settings.classicDark && !takeover && darkAllowed);

    if (takeover && !app && document.body) {
      app = NeoApp.mount(document, { api: NeoApi, settings });
    } else if (!takeover && app) {
      app.destroy();
      app = null;
      if (withoutHash(location.href) !== withoutHash(url)) location.reload();
    } else if (app && changedKeys.length > 0) {
      app.setSettings(settings, changedKeys);
    }

    clearTimeout(resumeTimer);
    const pauseLeft = settings.pausedUntil - Date.now();
    if (settings.enabled && pauseLeft > 0) resumeTimer = setTimeout(update, pauseLeft + 500);
  }

  function checkForExam() {
    domChecked = true;
    if (NeoGuard.hasExamContent(document)) examOnPage = true;
    update();
  }

  function whenBodyExists(callback) {
    if (document.body) return callback();
    const observer = new MutationObserver(() => {
      if (!document.body) return;
      observer.disconnect();
      callback();
    });
    observer.observe(html, { childList: true });
  }

  update();
  whenBodyExists(() => update());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForExam, { once: true });
  } else {
    checkForExam();
  }
  window.addEventListener('load', checkForExam, { once: true });

  NeoSettings.onChange(async (changes) => {
    settings = await NeoSettings.load();
    update(Object.keys(changes));
  });
})();
