const NeoThemes = (() => {
  const THEMES = {
    myetl: {
      name: 'myETL',
      mode: 'light',
      font: 'personal',
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      fill: '#F3F5F7',
      border: '#E2E6EB',
      text: '#293545',
      text2: '#657184',
      title: '#293545',
      accent: '#1A2D56',
      onAccent: '#FFFFFF',
      date: '#1A2D56',
      danger: '#D0021B',
      warn: '#B4570B',
      sidebar: '#1A2D56',
      sidebarText: '#FFFFFF',
      sidebarActive: '#FFFFFF',
      sidebarActiveText: '#1A2D56',
      palette: ['#1770AB', '#E71F63', '#0B874B', '#8F3E97', '#D97900', '#06A3B7'],
    },
    sage: {
      name: 'Sage',
      mode: 'light',
      font: 'serif',
      bg: '#F3F6EE',
      surface: '#FBFCF8',
      fill: '#E4EADB',
      border: '#D5DDC9',
      text: '#1F2A1B',
      text2: '#5B6752',
      title: '#3E5530',
      accent: '#4F6B3A',
      onAccent: '#FFFFFF',
      date: '#4F6B3A',
      danger: '#B3261E',
      warn: '#A15C07',
      sidebar: '#6F8A5C',
      sidebarText: '#FFFFFF',
      sidebarActive: '#3E5530',
      palette: ['#7C9A63', '#C79B5B', '#8DA3B8', '#C98C7A', '#9C8BB5', '#6FA39B'],
    },
    rose: {
      name: 'Rose',
      mode: 'light',
      font: 'sans',
      bg: '#FAF1E6',
      surface: '#FFF9F2',
      fill: '#F1E2D3',
      border: '#E6D2BF',
      text: '#2E1F2A',
      text2: '#715C66',
      title: '#7A4E7E',
      accent: '#7A4E7E',
      onAccent: '#FFFFFF',
      date: '#7A4E7E',
      danger: '#B3261E',
      warn: '#9A5B13',
      sidebar: '#C9877C',
      sidebarText: '#FFFFFF',
      sidebarActive: '#4A2C22',
      palette: ['#D98C8C', '#A7B97A', '#E2B86B', '#9AA9D6', '#C79BC9', '#86B3A8'],
    },
    cream: {
      name: 'Cream',
      mode: 'light',
      font: 'rounded',
      bg: '#F8F5EC',
      surface: '#FFFDF7',
      fill: '#ECE7D8',
      border: '#E1DACA',
      text: '#1E2440',
      text2: '#5A607A',
      accent: '#4F6FB0',
      onAccent: '#FFFFFF',
      date: '#4F6FB0',
      danger: '#C0392B',
      warn: '#A15C07',
      sidebar: '#EFEAD9',
      sidebarText: '#1E2440',
      sidebarActive: '#D9E3F6',
      palette: ['#6F8FC9', '#E3A07A', '#8DBF9A', '#C99BD6', '#E5C76B', '#7FB7C9'],
    },
    paper: {
      name: 'Paper',
      mode: 'light',
      font: 'serif',
      bg: '#F4F6F2',
      surface: '#FBFCFA',
      fill: '#E6EAE3',
      border: '#DBDFD7',
      text: '#111511',
      text2: '#5E645C',
      accent: '#1C6F68',
      onAccent: '#FFFFFF',
      date: '#1C6F68',
      danger: '#B42318',
      warn: '#B54708',
      sidebar: '#EBEEE8',
      sidebarText: '#111511',
      sidebarActive: '#DCE1D8',
      palette: ['#2E7D6B', '#4A6FA5', '#B5654A', '#8E6BB0', '#C08A2E', '#3F8F9E'],
    },
    midnight: {
      name: 'Midnight',
      mode: 'dark',
      font: 'sans',
      bg: '#0B1020',
      surface: '#121A2E',
      fill: '#1B2540',
      border: '#263152',
      text: '#E8ECF6',
      text2: '#9AA6C4',
      accent: '#6EA8FE',
      onAccent: '#0B1020',
      date: '#8FBFFF',
      danger: '#FF6B6B',
      warn: '#FFB454',
      sidebar: 'linear-gradient(180deg, #111A36 0%, #0B1020 100%)',
      sidebarText: '#E8ECF6',
      sidebarActive: '#1D2848',
      palette: ['#6EA8FE', '#C084FC', '#F472B6', '#34D399', '#FBBF24', '#60A5FA'],
    },
    snu: {
      name: 'SNU Navy',
      mode: 'light',
      font: 'sans',
      bg: '#F4F5FA',
      surface: '#FFFFFF',
      fill: '#E8EAF3',
      border: '#DCDFEA',
      text: '#0F0F2D',
      text2: '#5B5F78',
      accent: '#0F0F70',
      onAccent: '#FFFFFF',
      date: '#7D684D',
      danger: '#C0392B',
      warn: '#B7791F',
      sidebar: 'linear-gradient(180deg, #0F0F70 0%, #1E1E80 100%)',
      sidebarText: '#FFFFFF',
      sidebarActive: 'rgba(255, 255, 255, 0.16)',
      palette: ['#0F0F70', '#7D684D', '#2E5AAC', '#A23E48', '#3C7A5A', '#5E4B8B'],
    },
    catppuccin: {
      name: 'Catppuccin',
      mode: 'dark',
      font: 'rounded',
      bg: '#1E1E2E',
      surface: '#181825',
      fill: '#313244',
      border: '#313244',
      text: '#CDD6F4',
      text2: '#A6ADC8',
      accent: '#CBA6F7',
      onAccent: '#1E1E2E',
      date: '#89B4FA',
      danger: '#F38BA8',
      warn: '#FAB387',
      sidebar: '#11111B',
      sidebarText: '#CDD6F4',
      sidebarActive: '#313244',
      palette: ['#CBA6F7', '#F5C2E7', '#89B4FA', '#A6E3A1', '#FAB387', '#94E2D5', '#F9E2AF'],
    },
    sakura: {
      name: 'Sakura',
      mode: 'light',
      font: 'rounded',
      bg: '#FFF5F8',
      wallpaper:
        'radial-gradient(900px 500px at 10% -10%, #FFD9E6 0%, transparent 60%), radial-gradient(700px 400px at 95% 0%, #FFE8D6 0%, transparent 55%)',
      surface: '#FFFFFF',
      fill: '#FDE4EC',
      border: '#F6D0DD',
      text: '#3B1F2B',
      text2: '#8A5A6C',
      accent: '#E0457B',
      onAccent: '#FFFFFF',
      date: '#C2185B',
      danger: '#D32F2F',
      warn: '#D97706',
      sidebar: 'linear-gradient(180deg, #FFD3E2 0%, #FFEAF1 100%)',
      sidebarText: '#3B1F2B',
      sidebarActive: 'rgba(224, 69, 123, 0.16)',
      palette: ['#F06292', '#BA68C8', '#FF8A65', '#9575CD', '#F48FB1', '#4DB6AC'],
    },
    ocean: {
      name: 'Ocean',
      mode: 'light',
      font: 'rounded',
      glass: true,
      bg: '#DDEFF8',
      wallpaper: 'linear-gradient(135deg, #A1C4FD 0%, #C2E9FB 50%, #D4FCF5 100%)',
      surface: 'rgba(255, 255, 255, 0.62)',
      fill: 'rgba(255, 255, 255, 0.55)',
      border: 'rgba(11, 60, 90, 0.12)',
      text: '#0B2533',
      text2: '#3E6475',
      accent: '#0077B6',
      onAccent: '#FFFFFF',
      date: '#00618F',
      danger: '#C1121F',
      warn: '#B45309',
      sidebar: 'rgba(255, 255, 255, 0.42)',
      sidebarText: '#0B2533',
      sidebarActive: 'rgba(255, 255, 255, 0.72)',
      palette: ['#0077B6', '#00A6C8', '#023E8A', '#0096C7', '#48A9A6', '#5E60CE'],
    },
    sunset: {
      name: 'Sunset',
      mode: 'light',
      font: 'serif',
      glass: true,
      bg: '#FFE3D3',
      wallpaper: 'linear-gradient(160deg, #FF7E5F 0%, #FEB47B 38%, #FFD9B8 70%, #FFF0E6 100%)',
      surface: 'rgba(255, 255, 255, 0.64)',
      fill: 'rgba(255, 255, 255, 0.55)',
      border: 'rgba(120, 40, 10, 0.12)',
      text: '#3A1E14',
      text2: '#7A4A3A',
      accent: '#D9480F',
      onAccent: '#FFFFFF',
      date: '#B4400C',
      danger: '#C1121F',
      warn: '#A16207',
      sidebar: 'rgba(255, 255, 255, 0.38)',
      sidebarText: '#3A1E14',
      sidebarActive: 'rgba(255, 255, 255, 0.7)',
      palette: ['#E8590C', '#EF476F', '#F59E0B', '#B5179E', '#FF7E5F', '#7209B7'],
    },
    aurora: {
      name: 'Aurora',
      mode: 'dark',
      font: 'sans',
      glass: true,
      bg: '#070B17',
      wallpaper:
        'radial-gradient(1100px 600px at 5% -10%, rgba(56, 189, 248, 0.38), transparent 60%), radial-gradient(900px 520px at 95% 0%, rgba(168, 85, 247, 0.36), transparent 60%), radial-gradient(900px 600px at 50% 115%, rgba(34, 197, 94, 0.26), transparent 60%)',
      surface: 'rgba(17, 24, 39, 0.58)',
      fill: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)',
      text: '#EAF0FF',
      text2: '#A5B1CF',
      accent: '#38BDF8',
      onAccent: '#04111D',
      date: '#7DD3FC',
      danger: '#FB7185',
      warn: '#FBBF24',
      sidebar: 'rgba(10, 14, 28, 0.45)',
      sidebarText: '#EAF0FF',
      sidebarActive: 'rgba(255, 255, 255, 0.1)',
      palette: ['#38BDF8', '#A855F7', '#22C55E', '#F472B6', '#FACC15', '#2DD4BF'],
    },
    forest: {
      name: 'Forest',
      mode: 'dark',
      font: 'serif',
      bg: '#0F1A14',
      surface: '#15241B',
      fill: '#1E3326',
      border: '#24402F',
      text: '#E3F1E7',
      text2: '#93B5A0',
      accent: '#6BCB77',
      onAccent: '#0F1A14',
      date: '#9AD9A3',
      danger: '#FF7B7B',
      warn: '#F5C26B',
      sidebar: 'linear-gradient(180deg, #17301F 0%, #0F1A14 100%)',
      sidebarText: '#E3F1E7',
      sidebarActive: 'rgba(107, 203, 119, 0.16)',
      palette: ['#52B788', '#4D96FF', '#E9C46A', '#2A9D8F', '#95D5B2', '#F4A261'],
    },
    mint: {
      name: 'Mint',
      mode: 'dark',
      font: 'mono',
      bg: '#0F0F0F',
      surface: '#161616',
      fill: '#1F1F1F',
      border: '#262626',
      text: '#F2F2F2',
      text2: '#A3A3A3',
      accent: '#7CF3CB',
      onAccent: '#0F0F0F',
      date: '#7CF3CB',
      danger: '#FF6B6B',
      warn: '#FFC46B',
      sidebar: '#0A0A0A',
      sidebarText: '#F2F2F2',
      sidebarActive: '#1C2B26',
      palette: ['#2DD4BF', '#34D399', '#5EEAD4', '#10B981', '#14B8A6', '#6EE7B7'],
    },
    lavender: {
      name: 'Lavender',
      mode: 'light',
      font: 'rounded',
      bg: '#F6F3FF',
      surface: '#FFFFFF',
      fill: '#ECE6FF',
      border: '#DDD3FF',
      text: '#241B3D',
      text2: '#6B5E8E',
      accent: '#7C5CFF',
      onAccent: '#FFFFFF',
      date: '#6A4CE0',
      danger: '#E03131',
      warn: '#E67700',
      sidebar: 'linear-gradient(180deg, #E9E1FF 0%, #F6F3FF 100%)',
      sidebarText: '#241B3D',
      sidebarActive: 'rgba(124, 92, 255, 0.16)',
      palette: ['#7C5CFF', '#F783AC', '#4DABF7', '#38D9A9', '#FFA94D', '#B197FC'],
    },
    capybara: {
      name: 'Capybara',
      mode: 'dark',
      font: 'rounded',
      bg: '#170D03',
      surface: '#211507',
      fill: '#2E1E0B',
      border: '#3A2812',
      text: '#F5EFE6',
      text2: '#C8B49A',
      accent: '#DFA581',
      onAccent: '#170D03',
      date: '#E8BE96',
      danger: '#FF8A7A',
      warn: '#F2C14E',
      sidebar: 'linear-gradient(180deg, #9B5A32 0%, #1E1506 100%)',
      sidebarText: '#F5EFE6',
      sidebarActive: 'rgba(245, 239, 230, 0.14)',
      palette: ['#B07A4F', '#DFA581', '#8C5A3C', '#C9935E', '#6F4E37', '#E5B887'],
    },
    mono: {
      name: 'Mono',
      mode: 'light',
      font: 'mono',
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      fill: '#F1F1F1',
      border: '#E4E4E4',
      text: '#000000',
      text2: '#666666',
      accent: '#000000',
      onAccent: '#FFFFFF',
      date: '#000000',
      danger: '#D00000',
      warn: '#9A6700',
      sidebar: '#FAFAFA',
      sidebarText: '#000000',
      sidebarActive: '#EDEDED',
      palette: ['#111111', '#3A3A3A', '#5C5C5C', '#2B2B2B', '#4A4A4A', '#1F1F1F'],
    },
  };

  const AUTO = { light: 'myetl', dark: 'midnight' };

  const PALETTES = {
    course: null,
    theme: null,
    pastels: ['#F7B2BD', '#B5D8F7', '#C8E6C9', '#FFE0A3', '#D7C4F2', '#FFCCBC'],
    rainbow: ['#FF595E', '#FF924C', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93'],
    candy: ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF', '#F1C0E8'],
    ocean: ['#03045E', '#0077B6', '#00B4D8', '#48CAE4', '#023E8A', '#0096C7'],
    sunset: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#F9844A', '#E76F51'],
    forest: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#1B4332', '#95D5B2'],
  };

  const PRETENDARD = '"Neo Pretendard", Pretendard';
  const PERSONAL_FALLBACK = `"Neo NanumSquare", "SF Pro", -apple-system, BlinkMacSystemFont, ${PRETENDARD}, sans-serif`;
  const FONTS = {
    personal: `"Neo Compagnon", ${PERSONAL_FALLBACK}`,
    sans: `${PRETENDARD}, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`,
    system: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, ${PRETENDARD}, sans-serif`,
    apple: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif',
    rounded: `ui-rounded, "SF Pro Rounded", ${PRETENDARD}, -apple-system, system-ui, sans-serif`,
    serif: `ui-serif, "New York", "Iowan Old Style", Georgia, "AppleMyungjo", "Nanum Myeongjo", ${PRETENDARD}, serif`,
    mono: `ui-monospace, "SF Mono", "D2Coding", Menlo, ${PRETENDARD}, monospace`,
  };

  const CARD_STYLES = ['solid', 'gradient', 'pattern'];

  let signatureFonts = true;
  const setSignatureFonts = (available) => { signatureFonts = available; };
  const hasSignatureFonts = () => signatureFonts;

  function fontStack(fontSetting, theme, { headings = false, korean = false } = {}) {
    let key = fontSetting === 'theme' || !FONTS[fontSetting] ? theme.font ?? 'sans' : fontSetting;
    if (key === 'personal' && !signatureFonts) key = 'sans';
    if (key === 'personal' && headings) return `"Neo Marcellus", ${PERSONAL_FALLBACK}`;
    if (key === 'personal' && korean) return `"Neo Compagnon Letters", ${PERSONAL_FALLBACK}`;
    return FONTS[key] ?? FONTS.sans;
  }

  function inkFor(color, theme) {
    return theme.mode === 'dark' ? shade(color, 0.3) : luminance(color) > 0.35 ? shade(color, -0.35) : shade(color, -0.1);
  }

  function resolve(id, prefersDark, customSpec) {
    if (id === 'custom' && customSpec) return custom(customSpec);
    if (id === 'auto' || !THEMES[id]) return THEMES[AUTO[prefersDark ? 'dark' : 'light']];
    return THEMES[id];
  }

  const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value ?? ''));

  function mix(a, b, t) {
    const x = hexToRgb(a);
    const y = hexToRgb(b);
    if (!x || !y) return a;
    return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
  }

  function custom(spec) {
    const dark = spec.mode === 'dark';
    const bg = isHex(spec.bg) ? spec.bg : dark ? '#14121F' : '#F6F6F8';
    const accent = isHex(spec.accent) ? spec.accent : '#7C5CFF';
    const sidebar = isHex(spec.sidebar) ? spec.sidebar : bg;
    const text = dark ? '#F2F2F5' : '#141414';
    const sidebarText = textOn(sidebar) === '#FFFFFF' ? '#F5F5F7' : '#141414';
    return {
      name: 'Custom',
      mode: dark ? 'dark' : 'light',
      bg,
      surface: dark ? mix(bg, '#FFFFFF', 0.05) : mix(bg, '#FFFFFF', 0.7),
      fill: dark ? mix(bg, '#FFFFFF', 0.1) : mix(bg, '#000000', 0.06),
      border: dark ? mix(bg, '#FFFFFF', 0.13) : mix(bg, '#000000', 0.11),
      text,
      text2: mix(text, bg, 0.42),
      accent,
      onAccent: textOn(accent),
      date: dark ? mix(accent, '#FFFFFF', 0.25) : mix(accent, '#000000', 0.15),
      danger: dark ? '#FF6B6B' : '#C0392B',
      warn: dark ? '#FFC46B' : '#B7791F',
      sidebar,
      sidebarText,
      sidebarActive: `color-mix(in srgb, ${sidebarText} 15%, transparent)`,
      palette: [accent, mix(accent, '#FF6B6B', 0.5), mix(accent, '#4DABF7', 0.5), mix(accent, '#51CF66', 0.5), mix(accent, '#FCC419', 0.5), mix(accent, '#000000', 0.3)],
    };
  }

  const CODE_PREFIX = 'NEO1:';
  const CODE_KEYS = ['theme', 'customTheme', 'cardPalette', 'cardStyle', 'font'];

  function encodeCode(settings) {
    const picked = Object.fromEntries(CODE_KEYS.map((key) => [key, settings[key]]));
    return CODE_PREFIX + btoa(JSON.stringify(picked));
  }

  function decodeCode(code) {
    const text = String(code ?? '').trim();
    if (!text.startsWith(CODE_PREFIX)) return null;
    let data;
    try {
      data = JSON.parse(atob(text.slice(CODE_PREFIX.length)));
    } catch {
      return null;
    }
    if (!data || typeof data !== 'object') return null;
    const out = {};
    if (data.theme === 'auto' || data.theme === 'custom' || Object.hasOwn(THEMES, data.theme)) out.theme = data.theme;
    if (Object.hasOwn(PALETTES, data.cardPalette)) out.cardPalette = data.cardPalette;
    if (CARD_STYLES.includes(data.cardStyle)) out.cardStyle = data.cardStyle;
    if (Object.hasOwn(FONTS, data.font) || data.font === 'theme') out.font = data.font;
    const c = data.customTheme;
    if (c && typeof c === 'object' && ['light', 'dark'].includes(c.mode) && isHex(c.accent) && isHex(c.bg) && isHex(c.sidebar)) {
      out.customTheme = { mode: c.mode, accent: c.accent, bg: c.bg, sidebar: c.sidebar };
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  function hexToRgb(hex) {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
    if (!match) return null;
    const h = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }

  function luminance(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function textOn(hex) {
    const l = luminance(hex);
    return (1.05) / (l + 0.05) >= (l + 0.05) / 0.05 ? '#FFFFFF' : '#111111';
  }

  function shade(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const target = amount < 0 ? 0 : 255;
    const p = Math.abs(amount);
    const out = rgb.map((v) => Math.round(v + (target - v) * p));
    return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  function courseColor(course, index, theme, paletteId) {
    if (paletteId === 'course' && course.color) return course.color;
    const palette = PALETTES[paletteId] ?? theme.palette;
    const colours = palette && palette.length > 0 ? palette : theme.palette;
    return colours[index % colours.length];
  }

  const MOTIFS = ['sun', 'waves', 'dots', 'leaves', 'grid', 'confetti'];

  function motifSvg(color, motif) {
    const base = shade(color, 0.55);
    const ink = color;
    const soft = shade(color, 0.3);
    const parts = {
      sun: [80, `<rect width="80" height="80" fill="${base}"/><g fill="${ink}" opacity=".85"><circle cx="40" cy="40" r="11"/>${Array.from({ length: 12 }, (_, i) => `<rect x="38.5" y="14" width="3" height="10" rx="1.5" transform="rotate(${i * 30} 40 40)"/>`).join('')}</g><circle cx="6" cy="8" r="4" fill="${soft}"/><circle cx="74" cy="70" r="5" fill="${soft}"/>`],
      waves: [80, `<rect width="80" height="40" fill="${base}"/><path d="M0 14 Q20 2 40 14 T80 14" fill="none" stroke="${ink}" stroke-width="3" opacity=".8"/><path d="M0 30 Q20 18 40 30 T80 30" fill="none" stroke="${soft}" stroke-width="3"/>`],
      dots: [32, `<rect width="32" height="32" fill="${base}"/><circle cx="8" cy="8" r="4" fill="${ink}" opacity=".8"/><circle cx="24" cy="24" r="4" fill="${soft}"/>`],
      leaves: [56, `<rect width="56" height="56" fill="${base}"/><path d="M14 40 C14 22 30 14 42 14 C42 28 32 40 14 40 Z" fill="${ink}" opacity=".75"/><path d="M14 40 L36 20" stroke="${base}" stroke-width="1.5"/><circle cx="44" cy="44" r="3" fill="${soft}"/>`],
      grid: [40, `<rect width="40" height="40" fill="${base}"/><path d="M0 20H40M20 0V40" stroke="${soft}" stroke-width="2"/><rect x="14" y="14" width="12" height="12" rx="3" fill="${ink}" opacity=".7"/>`],
      confetti: [64, `<rect width="64" height="64" fill="${base}"/><rect x="8" y="10" width="10" height="4" rx="2" fill="${ink}" transform="rotate(25 13 12)"/><circle cx="44" cy="16" r="4" fill="${soft}"/><rect x="36" y="42" width="12" height="4" rx="2" fill="${ink}" opacity=".7" transform="rotate(-30 42 44)"/><circle cx="14" cy="48" r="3" fill="${ink}"/>`],
    };
    const [size, body] = parts[motif] ?? parts.dots;
    const height = motif === 'waves' ? 40 : size;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 ${size} ${height}">${body}</svg>`;
  }

  function cardBackground(color, style, index = 0) {
    if (style === 'solid') return color;
    if (style === 'gradient') return `linear-gradient(135deg, ${shade(color, 0.25)} 0%, ${color} 60%, ${shade(color, -0.2)} 100%)`;
    const svg = motifSvg(color, MOTIFS[index % MOTIFS.length]);
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") repeat, ${shade(color, 0.55)}`;
  }

  return {
    THEMES,
    AUTO,
    PALETTES,
    FONTS,
    CARD_STYLES,
    resolve,
    custom,
    mix,
    hexToRgb,
    luminance,
    textOn,
    shade,
    courseColor,
    cardBackground,
    fontStack,
    setSignatureFonts,
    hasSignatureFonts,
    inkFor,
    encodeCode,
    decodeCode,
  };
})();

if (typeof module === 'object') module.exports = NeoThemes;
