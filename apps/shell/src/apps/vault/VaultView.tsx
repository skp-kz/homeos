import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { EyeOff, Plus, RotateCw, Search, ShieldCheck } from 'lucide-react'
import type { AppViewProps } from '../../registry'
import { cn } from '../../lib/cn'
import { agents } from '../inbox/data'
import { Avatar, Chip } from '../inbox/parts'
import { audit, hourly, services, uncovered, type Secret } from './data'
import { useVault } from './store'
import { SECTIONS, SvcMark } from './VaultSidebar'
import { PutDialog } from './PutDialog'

const th = 'sticky top-0 border-b border-line bg-surface px-3 py-2.5 text-left font-ui text-xs font-medium tracking-[0.05em] text-muted uppercase'
const td = 'border-b border-line-soft px-3 py-2.5'
const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? id

function rotation(s: Secret) {
  if (s.expiresInDays != null) return <Chip tone="warn">истекает через {s.expiresInDays} дн</Chip>
  return <Chip tone="ok">{s.rotatedDaysAgo === 0 ? 'сегодня' : `${s.rotatedDaysAgo} дн назад`}</Chip>
}

function Btn({ primary, danger, children, onClick }: { primary?: boolean; danger?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-ui text-[13px] font-medium',
        primary ? 'border-accent bg-accent text-accent-text' : 'border-line bg-surface hover:bg-hover',
        danger && 'text-bad',
      )}
    >
      {children}
    </button>
  )
}

export function VaultView({ app, subpath, active }: AppViewProps) {
  const navigate = useNavigate()
  const secrets = useVault((s) => s.secrets)
  const [, section = '', selName = ''] = subpath.split('/')
  const [putOpen, setPutOpen] = useState(false)
  const [replace, setReplace] = useState<string | undefined>()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!active) return
    if (!SECTIONS.some((s) => s.id === section)) void navigate({ href: `${app.route}/secrets/${secrets[0].name}`, replace: true })
    else if (section === 'secrets' && !secrets.some((s) => s.name === selName) && secrets[0])
      void navigate({ href: `${app.route}/secrets/${secrets[0].name}`, replace: true })
  }, [active, section, selName, secrets, app.route, navigate])

  const title = SECTIONS.find((s) => s.id === section)?.title ?? 'Секреты'
  const expiring = secrets.filter((s) => s.expiresInDays != null).length
  const denied = audit.filter((c) => c.status >= 400).length
  const selected = secrets.find((s) => s.name === selName)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return secrets
    return secrets.filter((s) =>
      [s.name, s.description, svcName(s.service), ...s.grants.map((g) => agents.find((a) => a.id === g.agent)?.name ?? '')].join(' ').toLowerCase().includes(q),
    )
  }, [secrets, query])

  return (
    <div className="flex h-full min-w-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line py-3 pr-7 pl-12">
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          <Chip tone="ok">{secrets.length} активны</Chip>
          {expiring ? <Chip tone="warn">{expiring} пора ротировать</Chip> : null}
          {denied ? <Chip tone="bad">{denied} отказа за сутки</Chip> : null}
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-7 pt-5 pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
              {section === 'grants' ? <Grants /> : section === 'audit' ? <Audit /> : section === 'services' ? <Services /> : (
                <>
                  <div className="mb-4 flex items-start gap-3 rounded-lg border-l-[3px] border-accent bg-accent-soft px-4 py-3 text-sm">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
                    <span><b>Vault — посредник, а не хранилище.</b> Агент вызывает <code className="font-mono text-[12.5px]">vault.call(service, path)</code>, ключ подставляет Vault. Агенты видят только имена; значения не показываются никому, даже здесь.</span>
                  </div>
                  <div className="mb-3.5 flex flex-wrap items-center gap-2">
                    <label className="flex min-w-[220px] items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-ui text-[13px] text-muted">
                      <Search size={15} />
                      <input id="vault-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Имя, сервис, агент…" className="w-full bg-transparent text-text outline-none placeholder:text-muted" />
                    </label>
                    <span className="flex-1" />
                    <Btn primary onClick={() => { setReplace(undefined); setPutOpen(true) }}><Plus size={15} /> Новый секрет</Btn>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                    <table className="w-full min-w-[720px] border-separate border-spacing-0 font-ui text-[13.5px]">
                      <thead><tr><th className={th}>Имя</th><th className={th}>Сервис</th><th className={th}>Тип</th><th className={th}>Доступ</th><th className={th}>Вызовы 24 ч</th><th className={th}>Ротация</th></tr></thead>
                      <tbody>
                        {list.map((s) => {
                          const sel = s.name === selName
                          return (
                            <tr
                              key={s.name}
                              onClick={() => void navigate({ href: `${app.route}/secrets/${s.name}` })}
                              className={cn('cursor-pointer', sel ? 'bg-accent-soft [&>td:first-child]:shadow-[inset_3px_0_0_var(--accent)]' : 'hover:bg-hover')}
                            >
                              <td className={td}>
                                <span className="font-mono text-[13px] font-semibold">{s.name}</span>
                                <span className="block text-xs text-muted">{s.description}</span>
                              </td>
                              <td className={td}><span className="inline-flex items-center gap-2"><SvcMark id={s.service} size={20} />{svcName(s.service)}</span></td>
                              <td className={td}><Chip>{s.kind}</Chip></td>
                              <td className={td}><span className="inline-flex gap-1">{s.grants.map((g) => <Avatar key={g.agent} from={g.agent} size={22} presence={false} />)}{s.grants.length === 0 ? <span className="text-muted">—</span> : null}</span></td>
                              <td className={cn(td, 'tabular-nums')}>{s.calls24h}</td>
                              <td className={td}>{rotation(s)}</td>
                            </tr>
                          )
                        })}
                        {list.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-muted">Ничего не найдено</td></tr> : null}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 rounded-xl border border-line bg-surface px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2 font-ui"><b className="font-medium">Что Vault не покрывает</b><Chip>остаётся «Слава руками» на хостах</Chip></div>
                    <ul className="mt-2 mb-0 pl-5 text-sm text-muted">{uncovered.map((u) => <li key={u}>{u}</li>)}</ul>
                    <p className="mt-2 mb-0 font-ui text-xs text-muted">Позже — <code className="font-mono">vault.token</code>: короткоживущий токен с узким scope, если сервис такое умеет.</p>
                  </div>
                </>
              )}
              <p className="mt-6 font-ui text-xs text-muted">Демо-данные: позже — services/api (схема vault, vault.list / vault.call / vault.put / vault.audit).</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {section === 'secrets' && selected ? (
        <SecretCard s={selected} onReplace={() => { setReplace(selected.name); setPutOpen(true) }} />
      ) : null}
      <PutDialog open={putOpen} onOpenChange={setPutOpen} replace={replace} />
    </div>
  )
}

function SecretCard({ s, onReplace }: { s: Secret; onReplace: () => void }) {
  const revoke = useVault((st) => st.revoke)
  const calls = audit.filter((c) => c.secret === s.name).slice(0, 4)
  const max = Math.max(...hourly)
  const K = ({ children }: { children: React.ReactNode }) => <div className="mb-1.5 font-ui text-[11px] font-bold tracking-[0.07em] text-muted uppercase">{children}</div>
  return (
    <aside aria-label={`Секрет ${s.name}`} className="hidden w-[360px] shrink-0 flex-col gap-4.5 overflow-y-auto border-l border-line bg-surface px-5 pt-5 pb-8 xl:flex">
      <div>
        <div className="font-ui text-[12.5px] text-muted">{svcName(s.service)} · {s.kind}</div>
        <h2 className="mt-1 font-mono text-[17px] font-semibold break-all">{s.name}</h2>
        <p className="mt-1 mb-0 text-sm text-muted">{s.description}</p>
      </div>
      <div>
        <K>Значение</K>
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-line bg-bg px-3 py-2.5">
          <EyeOff size={15} className="text-muted" />
          <span className="flex-1 font-mono text-sm font-semibold tracking-[0.2em] text-muted">••••••••••••</span>
          <Btn onClick={onReplace}><RotateCw size={14} /> Заменить</Btn>
        </div>
        <p className="mt-1.5 mb-0 font-ui text-xs text-muted">Значение нельзя посмотреть: только заменить. Старое уходит в историю ротаций.</p>
      </div>
      <dl className="m-0 grid grid-cols-[110px_1fr] gap-x-2.5 gap-y-1.5 font-ui text-[13px]">
        <dt className="text-muted">Создал</dt><dd className="m-0">{s.createdBy} · {s.createdAt}</dd>
        <dt className="text-muted">Ротация</dt><dd className="m-0">{s.rotatedDaysAgo === 0 ? 'сегодня' : `${s.rotatedDaysAgo} дн назад`}</dd>
        <dt className="text-muted">Шифрование</dt><dd className="m-0">AES-256-GCM</dd>
        <dt className="text-muted">Защита ответа</dt><dd className="m-0 break-all">эхо ключа → <code className="font-mono text-xs">[redacted:{s.name}]</code></dd>
      </dl>
      <div>
        <K>Доступ</K>
        {s.grants.length === 0 ? <p className="m-0 text-sm text-muted">Ни у кого нет доступа.</p> : null}
        {s.grants.map((g) => (
          <div key={g.agent} className="flex items-center gap-2.5 border-b border-line-soft py-2 font-ui text-[13px] last:border-b-0">
            <Avatar from={g.agent} size={24} presence={false} />
            <div className="min-w-0 flex-1">
              <b className="block font-medium">{agents.find((a) => a.id === g.agent)?.name}</b>
              <span className="block truncate font-mono text-xs text-muted">{g.methods} {g.path}</span>
              {g.approval ? <span className="mt-0.5 inline-block"><Chip tone="warn">{g.approval} — с апрувом</Chip></span> : null}
            </div>
            <button type="button" onClick={() => revoke(s.name, g.agent)} className="rounded-md border border-line px-2 py-0.5 text-xs text-bad hover:bg-hover">Отозвать</button>
          </div>
        ))}
        <span className="mt-2 inline-block"><Btn><Plus size={14} /> Выдать агенту</Btn></span>
      </div>
      <div>
        <K>Лимит · {s.limit}</K>
        <div className="h-1.5 overflow-hidden rounded bg-line-soft"><i className={cn('block h-full', s.limitUsed >= 1 ? 'bg-bad' : 'bg-ok')} style={{ width: `${Math.min(100, s.limitUsed * 100)}%` }} /></div>
      </div>
      <div>
        <K>Вызовы за 14 ч</K>
        <div className="flex h-10 items-end gap-[3px]" aria-label="Вызовы по часам">
          {hourly.map((v, i) => <i key={i} className={cn('flex-1 rounded-t-sm bg-accent', i === hourly.length - 1 ? 'opacity-100' : 'opacity-50')} style={{ height: `${(v / max) * 100}%` }} />)}
        </div>
      </div>
      <div>
        <K>Последние вызовы</K>
        {calls.length === 0 ? <p className="m-0 text-sm text-muted">Пока не было.</p> : null}
        {calls.map((c) => (
          <div key={c.time} className="flex items-center gap-2 border-b border-line-soft py-1.5 font-ui text-[12.5px] last:border-b-0">
            <span className="text-muted tabular-nums">{c.time.slice(0, 5)}</span>
            <code className="min-w-0 flex-1 truncate font-mono text-xs">{c.req}</code>
            <span className={cn('font-mono text-xs font-semibold', c.status < 300 ? 'text-ok' : c.status < 400 ? 'text-warn' : 'text-bad')}>{c.status}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

function Grants() {
  const secrets = useVault((s) => s.secrets)
  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Chip>Матрица агент × секрет × scope</Chip>
        <span className="flex-1" />
        <span className="font-ui text-xs text-muted">Отзыв — удалить грант. Агенты гранты не меняют.</span>
        <Btn primary><Plus size={15} /> Выдать доступ</Btn>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 font-ui text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Секрет</th>
              {agents.map((a) => <th key={a.id} className={cn(th, 'text-center')}><span className="inline-flex items-center gap-1.5"><Avatar from={a.id} size={20} presence={false} />{a.name}</span></th>)}
              <th className={th}>Лимит</th>
            </tr>
          </thead>
          <tbody>
            {secrets.map((s) => (
              <tr key={s.name}>
                <td className={cn(td, 'font-mono text-[13px] font-semibold')}>{s.name}</td>
                {agents.map((a) => {
                  const g = s.grants.find((x) => x.agent === a.id)
                  return (
                    <td key={a.id} className={cn(td, 'text-center')}>
                      {g ? (
                        <span className="inline-flex flex-col items-center gap-0.5">
                          <Chip tone={g.methods === 'GET' && g.path === 'только чтение' ? 'info' : 'ok'}>{g.methods}</Chip>
                          <small className="font-mono text-[11px] text-muted">{g.path}</small>
                          {g.approval ? <Chip tone="warn">{g.approval} — с апрувом</Chip> : null}
                        </span>
                      ) : <span className="text-line">—</span>}
                    </td>
                  )
                })}
                <td className={cn(td, 'tabular-nums')}>{s.limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2.5 font-ui text-xs text-muted">Путь — относительно base_url сервиса: увести ключ на чужой хост нельзя. «С апрувом» — вызов уходит в Inbox и выполняется после «Разрешить».</p>
    </>
  )
}

function Audit() {
  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Chip>24 часа</Chip><Chip>Все статусы</Chip>
        <span className="flex-1" />
        <span className="font-ui text-xs text-muted">Значения ключей не логируются</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 font-ui text-[13.5px]">
          <thead><tr><th className={th}>Время</th><th className={th}>Агент</th><th className={th}>Секрет</th><th className={th}>Запрос</th><th className={th}>Ответ</th><th className={cn(th, 'text-right')}>Размер</th></tr></thead>
          <tbody>
            {audit.map((c) => (
              <tr key={c.time}>
                <td className={cn(td, 'tabular-nums')}>{c.time}</td>
                <td className={td}><span className="inline-flex items-center gap-1.5"><Avatar from={c.agent} size={20} presence={false} />{agents.find((a) => a.id === c.agent)?.name}</span></td>
                <td className={cn(td, 'font-mono text-xs font-semibold')}>{c.secret}</td>
                <td className={td}><code className="font-mono text-xs">{c.req}</code></td>
                <td className={td}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn('font-mono text-xs font-semibold', c.status < 300 ? 'text-ok' : c.status < 400 ? 'text-warn' : 'text-bad')}>{c.status}</span>
                    {c.note ? <Chip tone={c.note.tone}>{c.note.text}</Chip> : null}
                  </span>
                </td>
                <td className={cn(td, 'text-right tabular-nums')}>{c.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Services() {
  const secrets = useVault((s) => s.secrets)
  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Chip>Куда и как Vault подставляет ключ</Chip>
        <span className="flex-1" />
        <Btn><Plus size={15} /> Сервис</Btn>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {services.map((s) => {
          const n = secrets.filter((x) => x.service === s.id).length
          return (
            <section key={s.id} className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-2.5">
                <SvcMark id={s.id} size={26} />
                <b className="font-heading text-base font-semibold">{s.name}</b>
                <span className="ml-auto"><Chip tone={n ? 'ok' : 'muted'}>{n} {n === 1 ? 'секрет' : 'секрета'}</Chip></span>
              </div>
              <dl className="m-0 grid grid-cols-[96px_1fr] gap-x-2.5 gap-y-1 font-ui text-[13px]">
                <dt className="text-muted">base_url</dt><dd className="m-0 min-w-0 break-all font-mono text-xs">{s.baseUrl}</dd>
                <dt className="text-muted">подстановка</dt><dd className="m-0">{s.how}</dd>
              </dl>
              <div className="overflow-x-auto rounded-lg border border-line-soft bg-bg px-2.5 py-2 font-mono text-xs whitespace-pre">{s.inject}</div>
            </section>
          )
        })}
      </div>
    </>
  )
}
