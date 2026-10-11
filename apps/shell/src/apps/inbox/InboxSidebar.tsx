import { AlertTriangle, Clock, Inbox, MessageSquare, ShieldCheck, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppViewProps } from '../../registry'
import { cn } from '../../lib/cn'
import { agents, favorites } from './data'
import { inFolder, useInbox, type Folder } from './store'
import { Avatar } from './parts'

const FOLDERS: { id: Folder; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'Все входящие', icon: Inbox },
  { id: 'approval', label: 'Апрувы', icon: ShieldCheck },
  { id: 'message', label: 'Сообщения', icon: MessageSquare },
  { id: 'alert', label: 'Алерты', icon: AlertTriangle },
  { id: 'snoozed', label: 'Отложено', icon: Clock },
]

const PRESENCE_LABEL = { online: 'в работе', waiting: 'ждёт', offline: '' } as const

function Row({ active, onClick, children, count }: { active?: boolean; onClick?: () => void; children: React.ReactNode; count?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left font-[family-name:var(--font-ui)] text-sm text-text outline-none',
        'hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent',
        active && 'bg-accent-soft text-accent hover:bg-accent-soft',
      )}
    >
      {children}
      {count != null ? <span className={cn('ml-auto text-xs', active ? 'text-accent' : 'text-muted')}>{count}</span> : null}
    </button>
  )
}

export function InboxSidebar(_: AppViewProps) {
  const folder = useInbox((s) => s.folder)
  const setFolder = useInbox((s) => s.setFolder)
  const items = useInbox((s) => s.items)
  const decisions = useInbox((s) => s.decisions)

  return (
    <nav aria-label="Папки входящих" className="flex flex-col gap-0.5 px-2.5 pt-12 pb-4">
      {FOLDERS.map((f) => {
        const n = items.filter((it) => inFolder(it, f.id, decisions)).length
        return (
          <Row key={f.id} active={folder === f.id} onClick={() => setFolder(f.id)} count={n || undefined}>
            <f.icon size={16} strokeWidth={1.75} />
            {f.label}
          </Row>
        )
      })}

      <div className="px-2.5 pt-4 pb-1.5 font-[family-name:var(--font-ui)] text-[11px] font-bold tracking-[0.07em] text-muted uppercase">Агенты</div>
      {agents.map((a) => (
        <Row key={a.id} count={PRESENCE_LABEL[a.presence] || a.status.replace('Был ', '')}>
          <Avatar from={a.id} size={22} />
          {a.name}
        </Row>
      ))}

      <div className="px-2.5 pt-4 pb-1.5 font-[family-name:var(--font-ui)] text-[11px] font-bold tracking-[0.07em] text-muted uppercase">Избранное</div>
      {favorites.map((p) => {
        const n = items.filter((it) => it.project === p && !decisions[it.id] && it.unread).length
        return (
          <Row key={p} count={n || undefined}>
            <Star size={16} strokeWidth={1.75} className="text-accent" />
            {p}
          </Row>
        )
      })}
    </nav>
  )
}
