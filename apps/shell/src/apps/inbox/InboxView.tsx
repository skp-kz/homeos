import { useEffect, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Clock, CornerUpLeft, Paperclip, RotateCcw, X } from 'lucide-react'
import type { AppViewProps } from '../../registry'
import { cn } from '../../lib/cn'
import { age, agents, type Decision, type InboxItem } from './data'
import { inFolder, useInbox } from './store'
import { Avatar, Chip } from './parts'

const FOLDER_TITLE = { all: 'Все входящие', approval: 'Апрувы', message: 'Сообщения', alert: 'Алерты', snoozed: 'Отложено' } as const

const DECISION_TEXT: Record<Decision, string> = {
  approved: 'Разрешено',
  declined: 'Отклонено',
  snoozed: 'Отложено до понедельника',
}

function kindChip(it: InboxItem, d?: Decision) {
  if (d === 'approved') return <Chip tone="ok">разрешено</Chip>
  if (d === 'declined') return <Chip>отклонено</Chip>
  if (d === 'snoozed') return <Chip>отложено</Chip>
  if (it.kind === 'approval') return <Chip tone="accent">апрув</Chip>
  if (it.kind === 'alert') return <Chip tone="bad">алерт</Chip>
  return null
}

const sender = (it: InboxItem) => agents.find((a) => a.id === it.from)?.name ?? 'Мониторинг'

export function InboxView({ app, subpath, active }: AppViewProps) {
  const navigate = useNavigate()
  const items = useInbox((s) => s.items)
  const decisions = useInbox((s) => s.decisions)
  const folder = useInbox((s) => s.folder)
  const markRead = useInbox((s) => s.markRead)
  const decide = useInbox((s) => s.decide)
  const undo = useInbox((s) => s.undo)

  const list = useMemo(() => items.filter((it) => inFolder(it, folder, decisions)), [items, folder, decisions])
  const selectedId = subpath.replace(/^\//, '')
  const selected = items.find((it) => it.id === selectedId)
  const open = (id: string, replace = false) => void navigate({ href: `${app.route}/${id}`, replace })

  // Нет выбранного письма или оно не в текущей папке — открываем первое в папке (вкладка = URL: /inbox/<id>).
  useEffect(() => {
    if (!active) return
    if (list[0] && !list.some((it) => it.id === selected?.id)) open(list[0].id, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, selected, list])

  useEffect(() => {
    if (active && selected?.unread) markRead(selected.id)
  }, [active, selected, markRead])

  // j/k — по списку, a/d/s — решение по апруву. Только когда Inbox на экране и фокус не в поле ввода.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const i = list.findIndex((it) => it.id === selected?.id)
      const key = /^Key[A-Z]$/.test(e.code) ? e.code.slice(3).toLowerCase() : e.key
      if (key === 'j' && list[i + 1]) open(list[i + 1].id)
      else if (key === 'k' && i > 0) open(list[i - 1].id)
      else if (selected?.kind === 'approval' && !decisions[selected.id]) {
        if (key === 'a') decide(selected.id, 'approved')
        else if (key === 'd') decide(selected.id, 'declined')
        else if (key === 's') decide(selected.id, 'snoozed')
        else return
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, list, selected, decisions])

  const d = selected ? decisions[selected.id] : undefined

  return (
    <div className="flex h-full min-w-0">
      {/* Список */}
      <section aria-label="Список" className="flex w-[360px] shrink-0 flex-col border-r border-line bg-surface">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line-soft pr-4 pl-12">
          <h1 className="font-[family-name:var(--font-heading)] text-base font-semibold">{FOLDER_TITLE[folder]}</h1>
          <span className="font-[family-name:var(--font-ui)] text-xs text-muted">{list.length}</span>
          <span className="ml-auto rounded border border-line px-1.5 font-[family-name:var(--font-ui)] text-[11px] text-muted">j / k</span>
        </header>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <li className="px-6 py-10 text-center text-sm text-muted">Здесь пусто</li>
          ) : null}
          {list.map((it) => {
            const sel = it.id === selected?.id
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => open(it.id)}
                  aria-current={sel ? 'true' : undefined}
                  className={cn(
                    'flex w-full gap-2.5 border-b border-line-soft px-4 py-3 text-left outline-none focus-visible:bg-hover',
                    sel ? 'bg-accent-soft shadow-[inset_3px_0_0_var(--accent)]' : 'hover:bg-hover',
                  )}
                >
                  <Avatar from={it.from} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2 font-[family-name:var(--font-ui)] text-sm font-medium">
                      {it.unread ? <span className="size-[7px] shrink-0 -translate-y-px rounded-full bg-accent" aria-label="не прочитано" /> : null}
                      <span className="truncate">
                        {sender(it)} · {it.title}
                      </span>
                      <span className="ml-auto shrink-0 text-xs font-normal text-muted">{age(it.ageMin)}</span>
                    </span>
                    <span className="block truncate text-[13.5px] text-muted">{it.preview}</span>
                    {kindChip(it, decisions[it.id]) ? <span className="mt-1.5 block">{kindChip(it, decisions[it.id])}</span> : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Письмо */}
      <section aria-label="Письмо" className="min-w-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          {selected ? (
            <motion.article
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="mx-auto max-w-[760px] px-10 pt-14 pb-12"
            >
              <div className="font-[family-name:var(--font-ui)] text-[13px] text-muted">{selected.project}</div>
              <h2 className="mt-2 mb-1.5 font-[family-name:var(--font-heading)] text-2xl font-semibold text-balance">{selected.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {kindChip(selected, d)}
                <span className="font-[family-name:var(--font-ui)] text-[13px] text-muted">
                  {sender(selected)} · {age(selected.ageMin)} назад
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <Avatar from={selected.from} />
                <div className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3 leading-relaxed">
                  {selected.body}
                  {selected.attachment ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-line-soft bg-surface-2 px-3 py-2 font-[family-name:var(--font-mono)] text-[12.5px]">
                      <Paperclip size={14} className="shrink-0 text-muted" />
                      <span className="truncate">{selected.attachment}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {selected.kind === 'approval' ? (
                <div className={cn('mt-5 flex flex-col gap-3 rounded-xl border bg-surface p-4 shadow-sm', d ? 'border-line' : 'border-accent')}>
                  <div className="font-[family-name:var(--font-heading)] text-base font-semibold">Решение</div>
                  {d ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn('font-[family-name:var(--font-ui)] text-sm', d === 'approved' ? 'text-ok' : 'text-muted')}>
                        {DECISION_TEXT[d]}. {d === 'approved' ? `${sender(selected)} продолжит работу.` : ''}
                      </span>
                      <button type="button" onClick={() => undo(selected.id)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-muted hover:bg-hover">
                        <RotateCcw size={14} /> Вернуть
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => decide(selected.id, 'approved')} className="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-text">
                        <Check size={15} /> {selected.approveLabel ?? 'Разрешить'} <kbd className="ml-1 opacity-70">A</kbd>
                      </button>
                      <button type="button" onClick={() => decide(selected.id, 'declined')} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-medium hover:bg-hover">
                        <X size={15} /> Отклонить <kbd className="ml-1 text-muted">D</kbd>
                      </button>
                      <button type="button" onClick={() => decide(selected.id, 'snoozed')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted hover:bg-hover">
                        <Clock size={15} /> Отложить до понедельника <kbd className="ml-1">S</kbd>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 border-t border-line-soft pt-3 text-sm text-muted">
                    <CornerUpLeft size={15} />
                    Ответить {sender(selected)}… <span className="ml-auto font-[family-name:var(--font-ui)] text-xs">скоро</span>
                  </div>
                </div>
              ) : null}

              <p className="mt-8 font-[family-name:var(--font-ui)] text-xs text-muted">Демо-данные: решения не уходят агентам, пока нет бэкенда Inbox.</p>
            </motion.article>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">Выберите письмо</div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
