// HomeOS: the tab icon follows the colour theme. Inside the app the mark is drawn
// from --accent/--accent-fg, so it re-themes itself; the favicon is a static file,
// so swap it: warm → terracotta, light/dark → the neutral indigo set.
export function syncFaviconWithTheme(): void {
  const root = document.documentElement
  const apply = () => {
    const warm = root.getAttribute('data-theme') === 'warm'
    const svg = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    const ico = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="any"]')
    if (svg) svg.href = warm ? '/favicon-warm.svg?v=homeos2' : '/favicon.svg?v=homeos2'
    if (ico) ico.href = warm ? '/favicon-warm.ico?v=homeos2' : '/favicon.ico?v=homeos2'
  }
  apply()
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-theme'] })
}
