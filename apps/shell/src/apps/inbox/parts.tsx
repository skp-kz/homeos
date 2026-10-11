import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { agents, type AgentId, type Presence } from './data'

const AV_BG: Record<AgentId | 'monitoring', string> = {
  dev: 'bg-[#3a2a1a] dark:bg-[#4b4b57]',
  kura: 'bg-[#b4543a]',
  arman: 'bg-[#4f7a3a]',
  monitoring: 'bg-muted',
}

const PRESENCE: Record<Presence, string> = { online: 'bg-ok', waiting: 'bg-warn', offline: 'bg-[#bdb3a6]' }

export function Avatar({ from, size = 28, presence = true }: { from: AgentId | 'monitoring'; size?: number; presence?: boolean }) {
  const agent = agents.find((a) => a.id === from)
  return (
    <span
      className={cn('relative grid shrink-0 place-items-center rounded-lg font-[family-name:var(--font-heading)] font-semibold text-white', AV_BG[from])}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {agent ? agent.initial : <AlertTriangle size={size * 0.5} />}
      {agent && presence ? (
        <span
          className={cn('absolute -right-[3px] -bottom-[3px] rounded-full border-2 border-surface', PRESENCE[agent.presence])}
          style={{ width: Math.max(9, size * 0.36), height: Math.max(9, size * 0.36) }}
        />
      ) : null}
    </span>
  )
}

export function Chip({ tone = 'muted', children }: { tone?: 'muted' | 'accent' | 'ok' | 'warn' | 'bad'; children: React.ReactNode }) {
  const tones = {
    muted: 'bg-surface-2 text-muted',
    accent: 'bg-accent-soft text-accent',
    ok: 'bg-ok-soft text-ok',
    warn: 'bg-warn-soft text-warn',
    bad: 'bg-bad-soft text-bad',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 font-[family-name:var(--font-ui)] text-xs leading-[18px] font-medium whitespace-nowrap', tones[tone])}>
      {children}
    </span>
  )
}
