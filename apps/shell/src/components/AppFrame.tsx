import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { AppViewProps } from '../registry'
import { StubView } from '../apps/stub'
import { useShell } from '../store'
import { modKey } from './Rail'

// Экран приложения: [второй сайдбар | контент]. Сайдбар сворачивается (кнопка, ⌘\, перетаскивание
// за край), ширина и свёрнутость запоминаются по приложению (localStorage, homeos.layout.<id>).
export function AppFrame(props: AppViewProps) {
  const { app, active } = props
  const View = app.view ?? StubView
  const Sidebar = app.sidebar

  return (
    <motion.section
      aria-hidden={!active}
      initial={false}
      animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute inset-0 flex"
      style={{ pointerEvents: active ? 'auto' : 'none', visibility: active ? 'visible' : 'hidden' }}
    >
      {Sidebar ? <WithSidebar {...props} Sidebar={Sidebar} View={View} /> : <View {...props} />}
    </motion.section>
  )
}

function WithSidebar({
  Sidebar,
  View,
  ...props
}: AppViewProps & {
  Sidebar: NonNullable<AppViewProps['app']['sidebar']>
  View: NonNullable<AppViewProps['app']['view']>
}) {
  const { app, active } = props
  const panel = usePanelRef()
  const layout = useDefaultLayout({ id: `homeos.layout.${app.id}`, storage: localStorage })
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useShell((s) => s.sidebarToggle)
  const seen = useRef(toggle)

  useEffect(() => {
    if (toggle === seen.current) return
    seen.current = toggle
    if (!active) return
    const p = panel.current
    if (!p) return
    if (p.isCollapsed()) p.expand()
    else p.collapse()
  }, [toggle, active, panel])

  return (
    <Group
      id={`homeos.layout.${app.id}`}
      orientation="horizontal"
      defaultLayout={layout.defaultLayout}
      onLayoutChanged={layout.onLayoutChanged}
      className="h-full w-full"
    >
      <Panel
        id="sidebar"
        panelRef={panel}
        defaultSize={240}
        minSize={180}
        maxSize={420}
        collapsible
        collapsedSize={0}
        onResize={(size) => setCollapsed(size.inPixels < 1)}
        className="bg-surface"
      >
        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.16 }}
              className="h-full overflow-y-auto"
            >
              <Sidebar {...props} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Panel>
      <Separator className="w-px bg-line outline-none transition-colors hover:bg-muted data-[separator=active]:bg-muted" />
      <Panel id="main" minSize={320}>
        <div className="relative flex h-full flex-col">
          <button
            type="button"
            onClick={() => (panel.current?.isCollapsed() ? panel.current.expand() : panel.current?.collapse())}
            aria-label={collapsed ? 'Показать сайдбар' : 'Скрыть сайдбар'}
            title={`${collapsed ? 'Показать' : 'Скрыть'} сайдбар (${modKey}\\)`}
            className="absolute top-3 left-3 z-10 rounded-md p-1.5 text-muted hover:bg-hover hover:text-text"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <View {...props} />
        </div>
      </Panel>
    </Group>
  )
}
