import { Plus, Users } from 'lucide-react'
import type { AppViewProps } from '../../registry'
import { cn } from '../../lib/cn'
import { agents } from '../inbox/data'
import { Avatar } from '../inbox/parts'
import { projects } from './data'

function Row({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left font-ui outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent',
        active && 'bg-accent-soft hover:bg-accent-soft',
      )}
    >
      {children}
    </button>
  )
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2 pt-4 pb-1.5 font-ui text-[11px] font-bold tracking-[0.07em] text-muted uppercase">{children}</div>
)

export function AgentsSidebar(_: AppViewProps) {
  const online = agents.filter((a) => a.presence !== 'offline').length
  return (
    <nav aria-label="Агенты и проекты" className="flex flex-col gap-0.5 px-2.5 pt-12 pb-4">
      <Row active>
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-bg"><Users size={14} /></span>
        <span className="min-w-0">
          <b className="block text-sm font-medium">Все агенты</b>
          <span className="block text-xs text-muted">{agents.length} агента · {online} онлайн</span>
        </span>
      </Row>
      <Label>В штате</Label>
      {agents.map((a) => (
        <Row key={a.id}>
          <Avatar from={a.id} size={30} />
          <span className="min-w-0">
            <b className="block text-sm font-medium">{a.name}</b>
            <span className="block truncate text-xs text-muted">{a.status}</span>
          </span>
        </Row>
      ))}
      <Label>Проекты</Label>
      {projects.map((p) => (
        <Row key={p.name}>
          <span className="min-w-0">
            <b className="block text-sm font-medium">{p.name}</b>
            <span className={cn('block text-xs', p.waiting ? 'text-accent' : 'text-muted')}>
              {p.tasks} {p.tasks === 1 ? 'задача' : 'задачи'}{p.waiting ? ' · ждёт тебя' : ''}
            </span>
          </span>
        </Row>
      ))}
      <button type="button" className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-line px-2 py-2 font-ui text-[13px] text-muted hover:bg-hover">
        <Plus size={15} /> Нанять агента
      </button>
    </nav>
  )
}
