import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { apps } from './apps'
import type { AppDef } from './registry'
import { Rail } from './components/Rail'
import { AppFrame } from './components/AppFrame'
import { CommandPalette } from './components/CommandPalette'
import { useShell } from './store'
import { attachShellKeys, setShellKeyHandler } from './lib/keyboard'

export function appForPath(pathname: string): AppDef | undefined {
  return apps.find((a) => pathname === a.route || pathname.startsWith(a.route + '/'))
}

export function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useShell((s) => s.theme)
  const lastPath = useShell((s) => s.lastPath)
  const rememberPath = useShell((s) => s.rememberPath)

  const active = appForPath(location.pathname)

  // Приложения монтируются при первом открытии и дальше живут (скрытыми) — Wiki не перезагружается.
  const [mounted, setMounted] = useState<string[]>(() => (active ? [active.id] : []))
  useEffect(() => {
    if (active && !mounted.includes(active.id)) setMounted((m) => [...m, active.id])
  }, [active, mounted])

  useEffect(() => {
    if (active) rememberPath(active.id, location.href)
  }, [active, location.href, rememberPath])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (active && !active.view) document.title = `${active.title} · HomeOS`
  }, [active])

  const openApp = useCallback(
    (app: AppDef) => {
      const href = lastPath[app.id] ?? app.route
      void navigate({ href })
    },
    [lastPath, navigate],
  )

  // ⌘K — палитра, ⌘1…9 — приложения, ⌘\ — сайдбар. Ctrl — то же на не-Mac.
  useEffect(() => {
    setShellKeyHandler((e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const s = useShell.getState()
      if (e.key === 'k' || e.key === 'K' || e.code === 'KeyK') {
        e.preventDefault()
        e.stopPropagation()
        s.togglePalette()
      } else if (/^Digit[1-9]$/.test(e.code) && !e.shiftKey) {
        const app = apps[Number(e.code.slice(5)) - 1]
        if (!app) return
        e.preventDefault()
        e.stopPropagation()
        s.setPaletteOpen(false)
        openApp(app)
      } else if (e.code === 'Backslash') {
        e.preventDefault()
        e.stopPropagation()
        s.toggleSidebar()
      }
    })
    const detach = attachShellKeys(window)
    return () => {
      detach()
      setShellKeyHandler(null)
    }
  }, [openApp])

  const frames = useMemo(() => apps.filter((a) => mounted.includes(a.id)), [mounted])

  return (
    <div className="flex h-full">
      <Rail apps={apps} activeId={active?.id} onOpen={openApp} />
      <main className="relative min-w-0 flex-1 overflow-hidden bg-bg">
        {frames.map((app) => {
          const isActive = app.id === active?.id
          const path = isActive ? location.pathname : new URL(lastPath[app.id] ?? app.route, 'http://x').pathname
          return <AppFrame key={app.id} app={app} active={isActive} subpath={path.slice(app.route.length)} />
        })}
      </main>
      <CommandPalette apps={apps} onOpen={openApp} />
    </div>
  )
}
