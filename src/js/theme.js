(() => {
  if (window.stoneMassageTheme) {
    window.stoneMassageTheme.apply();
    return;
  }

  const parsePreference = (value) => value === 'dark' || value === 'light' ? value : null;
  let preference = null;
  try {
    preference = parsePreference(window.localStorage.getItem('theme'));
  } catch {
    // The system preference still works when browser storage is unavailable.
  }

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const resolveTheme = () => preference ?? (systemTheme.matches ? 'dark' : 'light');

  function apply(target = document) {
    const theme = resolveTheme();
    target.body.classList.toggle('dark-mode', theme === 'dark');
    target.documentElement.style.colorScheme = theme;
    target.getElementById('dark-mode-toggle')?.setAttribute('aria-pressed', String(theme === 'dark'));

    const canvas = window.getComputedStyle(document.body).getPropertyValue('--page-bg').trim();
    if (canvas) {
      target.querySelector('meta[name="theme-color"]')?.setAttribute('content', canvas);
    }
  }

  window.stoneMassageTheme = { apply };

  document.addEventListener('click', (event) => {
    if (!event.target.closest?.('#dark-mode-toggle')) return;
    preference = resolveTheme() === 'dark' ? 'light' : 'dark';
    try {
      window.localStorage.setItem('theme', preference);
    } catch {
      // Keep the explicit choice in memory for the rest of this visit.
    }
    apply();
  });

  systemTheme.addEventListener('change', () => {
    if (preference === null) apply();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== 'theme' && event.key !== null) return;
    preference = parsePreference(event.newValue);
    apply();
  });

  document.addEventListener('astro:before-swap', (event) => apply(event.newDocument));
  document.addEventListener('astro:after-swap', () => apply());
  document.addEventListener('astro:page-load', () => apply());
  document.addEventListener('DOMContentLoaded', () => apply(), { once: true });
  apply();
})();
