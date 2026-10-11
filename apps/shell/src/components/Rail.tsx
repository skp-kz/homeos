import * as Tooltip from '@radix-ui/react-tooltip'
import { motion } from 'motion/react'
import { Command, Moon, Sun } from 'lucide-react'
import type { AppDef } from '../registry'
import { useShell } from '../store'
import { cn } from '../lib/cn'

const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.platform)
export const modKey = isMac ? '⌘' : 'Ctrl+'

/** Знак HomeOS в цвете темы Wiki: тёплая — терракота, остальные — индиго. */
export const brandMark = (wikiTheme: string) => (wikiTheme === 'warm' ? '/favicon-warm.svg?v=homeos2' : '/shell/favicon.svg?v=homeos2')

function RailButton({
  label,
  hint,
  active,
  onClick,
  children,
}: {
  label: string
  hint?: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          onClick={onClick}
          className={cn(
            'relative flex size-10 items-center justify-center rounded-lg text-muted outline-none transition-colors',
            'hover:bg-hover hover:text-text focus-visible:ring-2 focus-visible:ring-accent',
            active && 'text-text',
          )}
        >
          {active ? (
            <motion.span
              layoutId="rail-active"
              className="absolute inset-0 rounded-lg bg-surface shadow-sm ring-1 ring-line"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
          ) : null}
          <span className="relative">{children}</span>
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-50 rounded-md bg-accent px-2 py-1 text-xs text-accent-text shadow-pop"
        >
          {label}
          {hint ? <span className="ml-2 opacity-60">{hint}</span> : null}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function Rail({
  apps,
  activeId,
  onOpen,
}: {
  apps: AppDef[]
  activeId: string | undefined
  onOpen: (app: AppDef) => void
}) {
  const theme = useShell((s) => s.theme)
  const toggleTheme = useShell((s) => s.toggleTheme)
  const togglePalette = useShell((s) => s.togglePalette)
  const wikiTheme = useShell((s) => s.wikiTheme)

  return (
    <Tooltip.Provider delayDuration={300}>
      <nav
        aria-label="Приложения"
        className="flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-line bg-rail py-3"
      >
        <img src={brandMark(wikiTheme)} alt="HomeOS" width={32} height={32} className="mb-2 size-8" />
        {apps.map((app, i) => {
          const Icon = app.icon
          return (
            <RailButton
              key={app.id}
              label={app.title}
              hint={i < 9 ? `${modKey}${i + 1}` : undefined}
              active={app.id === activeId}
              onClick={() => onOpen(app)}
            >
              <Icon size={18} strokeWidth={1.75} />
            </RailButton>
          )
        })}
        <div className="mt-auto flex flex-col items-center gap-1">
          <RailButton label="Палитра" hint={`${modKey}K`} onClick={togglePalette}>
            <Command size={18} strokeWidth={1.75} />
          </RailButton>
          <RailButton label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
          </RailButton>
        </div>
      </nav>
    </Tooltip.Provider>
  )
}
