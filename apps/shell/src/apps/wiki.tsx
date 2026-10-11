import { useEffect, useRef } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { AppViewProps } from '../registry'
import { attachShellKeys } from '../lib/keyboard'

// Wiki = tela как есть, в iframe того же origin. Caddy отдаёт tela на любой документ, который
// грузится во фрейм (Sec-Fetch-Dest: iframe), поэтому '/spaces/2/pages/12' внутри фрейма —
// это tela, а '/wiki/spaces/2/pages/12' в адресной строке — оболочка.
// URL синхронизируется в обе стороны: навигация внутри tela (pushState) переписывает адрес
// оболочки (replace — история браузера и так общая с фреймом), а смена адреса оболочки извне
// (⌘K, ввод URL) перегружает фрейм на нужный путь.

function framePath(subpath: string, search: string, hash: string) {
  return (subpath || '/') + search + hash
}

export function WikiView({ app, subpath, active }: AppViewProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const router = useRouter()
  const loc = router.state.location
  const want = framePath(subpath, loc.searchStr, loc.hash ? `#${loc.hash}` : '')
  // src задаём один раз — дальше фрейм живёт сам, иначе каждый клик перезагружал бы tela.
  const initialSrc = useRef(want)

  // Фрейм → оболочка.
  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    let detachKeys: (() => void) | undefined
    let restore: (() => void) | undefined

    const report = () => {
      const w = iframe.contentWindow
      if (!w) return
      const { pathname, search, hash } = w.location
      const href = (pathname === '/' ? app.route : app.route + pathname) + search + hash
      const cur = router.state.location
      if (cur.pathname.startsWith(app.route) && cur.href !== href) {
        void router.navigate({ href, replace: true })
      }
      if (w.document.title) document.title = `${w.document.title} · HomeOS`
    }

    const onLoad = () => {
      restore?.()
      detachKeys?.()
      const w = iframe.contentWindow
      if (!w) return
      try {
        detachKeys = attachShellKeys(w)
        const h = w.history
        const push = h.pushState.bind(h)
        const replace = h.replaceState.bind(h)
        h.pushState = (...args: Parameters<History['pushState']>) => {
          push(...args)
          report()
        }
        h.replaceState = (...args: Parameters<History['replaceState']>) => {
          replace(...args)
          report()
        }
        w.addEventListener('popstate', report)
        restore = () => {
          h.pushState = push
          h.replaceState = replace
          w.removeEventListener('popstate', report)
        }
        report()
      } catch {
        // Чужой origin (не должно случаться) — просто живём без синхронизации.
      }
    }

    iframe.addEventListener('load', onLoad)
    return () => {
      iframe.removeEventListener('load', onLoad)
      restore?.()
      detachKeys?.()
    }
  }, [app.route, router])

  // Оболочка → фрейм: только если адрес поменяли снаружи.
  useEffect(() => {
    if (!active) return
    const w = ref.current?.contentWindow
    if (!w) return
    try {
      const { pathname, search, hash } = w.location
      if (w.location.href === 'about:blank') return
      if (pathname + search + hash !== want) w.location.replace(want)
    } catch {
      /* noop */
    }
  }, [want, active])

  return (
    <iframe
      ref={ref}
      title={app.title}
      src={initialSrc.current}
      className="h-full w-full border-0 bg-bg"
    />
  )
}
