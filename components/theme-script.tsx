// Inline script that runs before paint to set [data-theme] from localStorage,
// avoiding a flash-of-wrong-theme on initial load.
const SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem('locus-theme');
    if (t === 'dark' || t === 'light') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export function ThemeScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
  );
}
