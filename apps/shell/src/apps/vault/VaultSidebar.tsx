import { useNavigate } from '@tanstack/react-router'
import { Grid2x2, KeyRound, List, Lock, ScrollText, Server } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AppViewProps } from '../../registry'
import { cn } from '../../lib/cn'
import { agents } from '../inbox/data'
import { Avatar } from '../inbox/parts'
import { audit, services } from './data'
import { useVault } from './store'

export const SECTIONS: { id: string; title: string; icon: LucideIcon }[] = [
  { id: 'secrets', title: 'Секреты', icon: List },
  { id: 'grants', title: 'Гранты', icon: Grid2x2 },
  { id: 'audit', title: 'Журнал', icon: ScrollText },
  { id: 'services', title: 'Сервисы', icon: Server },
]

export function SvcMark({ id, size = 22 }: { id: string; size?: number }) {
  const s = services.find((x) => x.id === id)
  return (
    <span className="grid shrink-0 place-items-center rounded-md font-heading font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.45, background: s?.color }} aria-hidden>
      {s?.mark}
    </span>
  )
}

function Row({ active, onClick, children, count }: { active?: boolean; onClick?: () => void; children: React.ReactNode; count?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left font-ui text-sm outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent',
        active && 'bg-accent-soft text-accent hover:bg-accent-soft',
      )}
    >
      {children}
      {count != null ? <span className={cn('ml-auto text-xs', active ? 'text-accent' : 'text-muted')}>{count}</span> : null}
    </button>
  )
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2.5 pt-4 pb-1.5 font-ui text-[11px] font-bold tracking-[0.07em] text-muted uppercase">{children}</div>
)

export function VaultSidebar({ app, subpath }: AppViewProps) {
  const navigate = useNavigate()
  const secrets = useVault((s) => s.secrets)
  const section = subpath.split('/')[1] || 'secrets'
  const counts: Record<string, React.ReactNode> = {
    secrets: secrets.length,
    grants: secrets.reduce((n, s) => n + s.grants.length, 0),
    audit: `${audit.length} / сут`,
    services: services.length,
  }

  return (
    <nav aria-label="Разделы Vault" className="flex flex-col gap-0.5 px-2.5 pt-12 pb-4">
      <div className="flex items-center gap-2 px-2.5 pb-1 font-heading text-lg font-semibold">
        <KeyRound size={18} className="text-accent" /> Vault
      </div>
      <div className="flex items-center gap-1.5 px-2.5 pb-3 font-ui text-xs text-muted">
        <Lock size={13} /> AES-256-GCM · мастер-ключ вне БД
      </div>
      {SECTIONS.map((s) => (
        <Row key={s.id} active={section === s.id} onClick={() => void navigate({ href: `${app.route}/${s.id}` })} count={counts[s.id]}>
          <s.icon size={16} strokeWidth={1.75} />
          {s.title}
        </Row>
      ))}
      <Label>Сервисы</Label>
      {services.map((s) => (
        <Row key={s.id} onClick={() => void navigate({ href: `${app.route}/services` })} count={secrets.filter((x) => x.service === s.id).length || undefined}>
          <SvcMark id={s.id} />
          {s.name}
        </Row>
      ))}
      <Label>Агенты</Label>
      {agents.map((a) => (
        <Row key={a.id} onClick={() => void navigate({ href: `${app.route}/grants` })} count={secrets.filter((x) => x.grants.some((g) => g.agent === a.id)).length}>
          <Avatar from={a.id} size={22} presence={false} />
          {a.name}
        </Row>
      ))}
    </nav>
  )
}
