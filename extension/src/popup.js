const HOUR_MS = 60 * 60 * 1000;
const $ = (id) => document.getElementById(id);
const t = (key, substitutions) => chrome.i18n.getMessage(key, substitutions) || key;

document.documentElement.lang = chrome.i18n.getUILanguage();
document.fonts.load('14px "Neo Compagnon"').then(
  (faces) => document.documentElement.classList.toggle('no-signature-fonts', faces.length === 0),
  () => document.documentElement.classList.add('no-signature-fonts'),
);
for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);

async function render() {
  const s = await NeoSettings.load();
  const paused = s.pausedUntil > Date.now();
  $('newInterface').checked = s.newInterface;
  $('classicDark').checked = s.classicDark;
  $('theme').value = s.theme;

  const status = $('status');
  if (!s.enabled) {
    status.textContent = t('statusOff');
    status.className = 'status off';
  } else if (paused) {
    const time = new Intl.DateTimeFormat(chrome.i18n.getUILanguage(), { hour: '2-digit', minute: '2-digit' })
      .format(new Date(s.pausedUntil));
    status.textContent = t('statusPausedUntil', [time]);
    status.className = 'status off';
  } else {
    status.textContent = t('statusOn');
    status.className = 'status on';
  }

  const running = s.enabled && !paused;
  $('pause1').hidden = !running;
  $('pause3').hidden = !running;
  $('turnOff').hidden = !s.enabled;
  $('resume').hidden = running;
}

$('newInterface').addEventListener('change', (e) => NeoSettings.save({ newInterface: e.target.checked }));
$('classicDark').addEventListener('change', (e) => NeoSettings.save({ classicDark: e.target.checked }));
$('theme').addEventListener('change', (e) => NeoSettings.save({ theme: e.target.value }));

for (const [value, label] of [['auto', t('themeAuto')], ...Object.entries(NeoThemes.THEMES).map(([id, th]) => [id, th.name]), ['custom', t('themeCustom')]]) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  $('theme').append(option);
}
$('pause1').addEventListener('click', () => NeoSettings.save({ pausedUntil: Date.now() + HOUR_MS }));
$('pause3').addEventListener('click', () => NeoSettings.save({ pausedUntil: Date.now() + 3 * HOUR_MS }));
$('turnOff').addEventListener('click', () => NeoSettings.save({ enabled: false, pausedUntil: 0 }));
$('resume').addEventListener('click', () => NeoSettings.save({ enabled: true, pausedUntil: 0 }));
$('openSettings').addEventListener('click', () => {
  chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
});

NeoSettings.onChange(render);
render();
