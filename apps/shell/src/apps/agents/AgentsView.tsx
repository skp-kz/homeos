import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import type { AppViewProps } from '../../registry'
import { cn } from '../../lib/cn'
import { agents } from '../inbox/data'
import { Chip } from '../inbox/parts'
import { skills, tasks } from './data'
import { FlowsPanel, KanbanPanel, OfficePanel, OrgPanel, SkillsPanel } from './panels'

// Вкладки Agents. Вкладка = URL: /agents/<id>.
const TABS = [
  { id: 'kanban', title: 'Канбан', count: tasks.length, Panel: KanbanPanel },
  { id: 'skills', title: 'Skills', count: skills.reduce((n, g) => n + g.rows.length, 0), Panel: SkillsPanel },
  { id: 'org', title: 'Орг структура', Panel: OrgPanel },
  { id: 'flows', title: 'Workflows', count: 3, Panel: FlowsPanel },
  { id: 'office', title: 'Карта офиса', Panel: OfficePanel },
] as const

export function AgentsView({ app, subpath, active }: AppViewProps) {
  const navigate = useNavigate()
  const tabId = subpath.split('/')[1] ?? ''
  const tab = TABS.find((t) => t.id === tabId)

  useEffect(() => {
    if (active && !tab) void navigate({ href: `${app.route}/${TABS[0].id}`, replace: true })
  }, [active, tab, app.route, navigate])

  const current = tab ?? TABS[0]
  const online = agents.filter((a) => a.presence !== 'offline').length
  const waiting = tasks.filter((t) => t.state === 'human').length

  return (
    <div className="flex h-full min-w-0 flex-col">
      <header className="shrink-0 border-b border-line pt-3 pr-7 pl-12">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-semibold">Агенты</h1>
          <Chip tone="ok">{online} онлайн</Chip>
          {waiting ? <Chip tone="accent">{waiting} ждёт тебя</Chip> : null}
        </div>
        <nav role="tablist" aria-label="Разделы агентов" className="mt-2 flex gap-0.5 overflow-x-auto">
          {TABS.map((t) => {
            const sel = t.id === current.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={sel}
                onClick={() => void navigate({ href: `${app.route}/${t.id}` })}
                className={cn(
                  'inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 font-ui text-sm font-medium whitespace-nowrap outline-none focus-visible:bg-hover',
                  sel ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text',
                )}
              >
                {t.title}
                {'count' in t ? <span className="rounded-full bg-surface-2 px-1.5 text-[11px] text-muted">{t.count}</span> : null}
              </button>
            )
          })}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-auto px-7 pt-5 pb-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
            <current.Panel />
          </motion.div>
        </AnimatePresence>
        <p className="mt-6 font-ui text-xs text-muted">Демо-данные: позже — runner Minidesk (/api/agents/state) и навыки из Connections.</p>
      </div>
    </div>
  )
}
