const NeoSettings = (() => {
  const DEFAULTS = Object.freeze({
    enabled: true,
    pausedUntil: 0,
    newInterface: true,
    classicDark: false,

    theme: 'myetl',
    customTheme: { mode: 'dark', accent: '#7C5CFF', bg: '#14121F', sidebar: '#1D1A2E' },
    cardPalette: 'course',
    cardStyle: 'solid',
    font: 'theme',
    wallpaper: 'theme',
    wallpaperImage: '',
    covers: {},
    condensed: true,
    showTodo: false,
    tabIcons: true,
    customCss: '',

    checked: {},
    readAnnouncements: {},
  });

  async function load() {
    return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
  }

  function save(patch) {
    return chrome.storage.local.set(patch);
  }

  function onChange(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') callback(changes);
    });
  }

  return { DEFAULTS, load, save, onChange };
})();

if (typeof module === 'object') module.exports = NeoSettings;
