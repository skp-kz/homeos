import { useState } from 'react'
import { ArrowRight, Check, Clock, Plus, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/cn'
import { agents, type AgentId } from '../inbox/data'
import { Avatar, Chip } from '../inbox/parts'
import { columns, duties, flows, skills, tasks as demoTasks, type Access, type FlowStep, type RunState } from './data'

const Btn = ({ primary, children, onClick }: { primary?: boolean; children: React.ReactNode; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-ui text-[13px] font-medium',
      primary ? 'border-accent bg-accent text-accent-text' : 'border-line bg-surface hover:bg-hover',
    )}
  >
    {children}
  </button>
)

const Human = ({ size = 22, letter = 'С' }: { size?: number; letter?: string }) => (
  <span
    className="grid shrink-0 place-items-center rounded-md border border-line bg-surface-2 font-heading font-semibold text-text"
    style={{ width: size, height: size, fontSize: size * 0.45 }}
    aria-hidden
  >
    {letter}
  </span>
)

function Who({ who, size = 22 }: { who?: AgentId | 'slava'; size?: number }) {
  if (!who) return null
  return who === 'slava' ? <Human size={size} /> : <Avatar from={who} size={size} presence={false} />
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>
}

/* ───────── Канбан ───────── */
export function KanbanPanel() {
  const [tasks, setTasks] = useState(demoTasks)
  const move = (id: string, state: RunState) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, state } : t)))

  return (
    <>
      <Toolbar>
        <Chip>Все агенты</Chip>
        <Chip>Все проекты</Chip>
        <span className="flex-1" />
        <span className="font-ui text-[12.5px] text-muted">Lease 30 мин · протухшие возвращаются в Inbox</span>
        <Btn primary>
          <Plus size={15} /> Задача агенту
        </Btn>
      </Toolbar>
      <div className="overflow-x-auto pb-1.5">
        <div className="grid min-w-[1044px] grid-cols-6 gap-2.5">
          {columns.map((col) => {
            const list = tasks.filter((t) => t.state === col.id)
            const human = col.id === 'human'
            return (
              <section key={col.id} className={cn('flex flex-col gap-2 rounded-xl p-2.5', human ? 'bg-accent-soft' : 'bg-surface-2')}>
                <h3 className={cn('flex justify-between px-1 pt-0.5 pb-1 font-ui text-xs font-bold tracking-[0.06em] uppercase', human ? 'text-accent' : 'text-muted')}>
                  {col.title} <span>{list.length}</span>
                </h3>
                {list.map((t) => (
                  <article key={t.id} className={cn('flex flex-col gap-2 rounded-lg border bg-surface px-3 py-2.5 shadow-sm', human ? 'border-accent' : 'border-line')}>
                    <div className="text-sm leading-snug">{t.title}</div>
                    {t.steps ? (
                      <div className="h-1 overflow-hidden rounded bg-line-soft">
                        <i className="block h-full bg-accent" style={{ width: `${(t.steps[0] / t.steps[1]) * 100}%` }} />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-1.5 font-ui text-xs text-muted">
                      <Avatar from={t.agent} size={20} presence={false} />
                      {t.project}
                      <span className="ml-auto tabular-nums">
                        {t.steps ? `${t.steps[0]}/${t.steps[1]}` : ''}
                        {t.cost ? ` · ${t.cost}` : ''}
                        {t.note && t.note !== 'автопроверка' ? (t.steps ? ` · ${t.note}` : t.note) : ''}
                      </span>
                    </div>
                    {t.note === 'автопроверка' ? <span><Chip tone="info">автопроверка</Chip></span> : null}
                    {col.id === 'done' ? <span><Chip tone="ok">принято</Chip></span> : null}
                    {human ? (
                      <div className="flex flex-wrap gap-1.5">
                        <Chip tone="accent">твой апрув</Chip>
                        <span className="basis-full" />
                        <Btn primary onClick={() => move(t.id, 'done')}><Check size={14} /> Принять</Btn>
                        <Btn onClick={() => move(t.id, 'working')}>Доработать</Btn>
                      </div>
                    ) : null}
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}

/* ───────── Skills ───────── */
const ACCESS: Record<Access, { cls: string; mark: string; label: string }> = {
  yes: { cls: 'bg-ok-soft text-ok', mark: '✓', label: 'может сам' },
  ask: { cls: 'bg-warn-soft text-warn', mark: '?', label: 'только с апрувом в Inbox' },
  no: { cls: 'text-line', mark: '—', label: 'нет доступа' },
}

export function SkillsPanel() {
  return (
    <>
      <Toolbar>
        <Chip>Матрица доступа: навык × агент</Chip>
        <span className="flex-1" />
        <Btn><Plus size={15} /> Навык или MCP-сервер</Btn>
      </Toolbar>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 font-ui text-[13.5px]">
          <thead>
            <tr className="text-left text-xs tracking-[0.05em] text-muted uppercase">
              <th className="border-b border-line-soft px-3 py-2.5 font-medium">Навык</th>
              <th className="border-b border-line-soft px-3 py-2.5 font-medium">Источник</th>
              {agents.map((a) => (
                <th key={a.id} className="border-b border-line-soft px-3 py-2.5 text-center text-[13px] font-medium tracking-normal text-text normal-case">
                  <span className="inline-flex items-center gap-1.5"><Avatar from={a.id} size={20} presence={false} />{a.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skills.map((g) => (
              <SkillGroup key={g.group} group={g} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 font-ui text-[12.5px] text-muted">
        {(Object.keys(ACCESS) as Access[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn('grid size-5 place-items-center rounded-md', ACCESS[k].cls)}>{ACCESS[k].mark}</span>
            {ACCESS[k].label}
          </span>
        ))}
        <span>Деплой и миграции — только Слава</span>
      </div>
    </>
  )
}

function SkillGroup({ group }: { group: (typeof skills)[number] }) {
  return (
    <>
      <tr>
        <td colSpan={2 + agents.length} className="border-b border-line-soft bg-surface-2 px-3 py-2 text-[11px] font-bold tracking-[0.07em] text-muted uppercase">
          {group.group}
        </td>
      </tr>
      {group.rows.map((r) => (
        <tr key={r.name}>
          <td className="border-b border-line-soft px-3 py-2.5">{r.name}</td>
          <td className="border-b border-line-soft px-3 py-2.5 font-mono text-xs">{r.source}</td>
          {agents.map((a) => {
            const v = ACCESS[r.access[a.id]]
            return (
              <td key={a.id} className="border-b border-line-soft px-3 py-2 text-center">
                <span className={cn('inline-grid size-[26px] place-items-center rounded-lg', v.cls)} title={v.label}>{v.mark}</span>
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}

/* ───────── Орг структура ───────── */
function OrgNode({ avatar, name, sub }: { avatar: React.ReactNode; name: string; sub: string }) {
  return (
    <div className="flex min-w-[230px] items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      {avatar}
      <div>
        <b className="block font-heading text-base font-semibold">{name}</b>
        <span className="font-ui text-[12.5px] text-muted">{sub}</span>
      </div>
    </div>
  )
}

export function OrgPanel() {
  return (
    <div className="overflow-x-auto">
      <div className="mx-auto flex min-w-[760px] max-w-[980px] flex-col items-center pt-1.5">
        <OrgNode avatar={<Human size={44} />} name="Слава" sub="Владелец СКП · апрувы, деплой, миграции" />
        <div className="h-6 w-0.5 bg-line" />
        <OrgNode
          avatar={<span className="grid size-11 place-items-center rounded-xl bg-accent font-heading text-lg text-accent-text">⌘</span>}
          name="Оркестратор HomeOS"
          sub="Inbox · runner · лимиты шагов и $"
        />
        <div className="relative grid w-full grid-cols-3 gap-6 pt-6 before:absolute before:top-0 before:right-[16.66%] before:left-[16.66%] before:h-0.5 before:bg-line">
          {agents.map((a) => (
            <div key={a.id} className="relative flex flex-col items-center gap-2.5 before:absolute before:-top-6 before:left-1/2 before:h-6 before:w-0.5 before:bg-line">
              <OrgNode avatar={<Avatar from={a.id} size={44} />} name={a.name} sub={duties[a.id].title} />
              <ul className="flex w-full flex-col gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-3 text-[13.5px]">
                {duties[a.id].lines.map((l) => (
                  <li key={l} className="flex gap-2"><span className="font-bold text-accent">·</span>{l}</li>
                ))}
                <li className="flex gap-2 text-muted"><span className="font-bold text-accent">·</span>{duties[a.id].channel}</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-[13.5px]">
          <ShieldCheck size={18} className="shrink-0 text-accent" />
          <span>Агенты создают задачи и комментируют друг друга, но <b>не апрувят</b>: всё, что уходит наружу или в прод, проходит через твой Inbox.</span>
        </div>
        <div className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-[13.5px]">
          <Human size={22} letter="Д" />
          <span>Дима — инженер, работает в Minidesk как человек; на доску агентов людей не сажаем.</span>
        </div>
      </div>
    </div>
  )
}

/* ───────── Workflows ───────── */
function Step({ s }: { s: FlowStep }) {
  return (
    <div
      className={cn(
        'flex min-w-[150px] flex-1 flex-col gap-1.5 rounded-lg border px-3 py-2.5',
        s.gate ? 'border-accent bg-accent-soft' : 'border-line bg-bg',
        s.live && 'ring-2 ring-ok',
      )}
    >
      <b className="font-ui text-[13.5px] font-medium">{s.gate ? '◆ ' : ''}{s.name}</b>
      <span className="flex items-center gap-1.5 font-ui text-xs text-muted">
        <Who who={s.who} size={20} />
        {s.who === 'slava' ? 'Слава · ' : s.who ? `${agents.find((a) => a.id === s.who)?.name} · ` : ''}
        {s.note}
      </span>
    </div>
  )
}

export function FlowsPanel() {
  return (
    <>
      <Toolbar>
        <Chip>{flows.length} процесса</Chip>
        <Chip>◆ — точка твоего решения</Chip>
        <span className="flex-1" />
        <Btn><Plus size={15} /> Новый процесс</Btn>
      </Toolbar>
      <div className="flex flex-col gap-3.5">
        {flows.map((f) => (
          <section key={f.name} className="rounded-xl border border-line bg-surface p-4">
            <header className="mb-3.5 flex flex-wrap items-center gap-2.5">
              <h3 className="font-heading text-[17px] font-semibold">{f.name}</h3>
              {f.status === 'active' ? <Chip tone="ok">активен</Chip> : <Chip>по запросу</Chip>}
              <span className="ml-auto inline-flex items-center gap-1.5 font-ui text-[12.5px] text-muted"><Clock size={14} />{f.meta}</span>
            </header>
            <div className="flex items-stretch overflow-x-auto pb-1">
              {f.steps.map((s, i) => (
                <div key={s.name} className="flex flex-1 items-stretch">
                  {i > 0 ? <span className="grid w-6 shrink-0 place-items-center text-muted"><ArrowRight size={16} /></span> : null}
                  <Step s={s} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

/* ───────── Карта офиса ───────── */
export function OfficePanel() {
  const ink = 'var(--sepia-ink)'
  const line = 'var(--sepia-line)'
  const paper = 'var(--sepia)'
  const T = (p: React.SVGProps<SVGTextElement>) => <text fill={ink} fontFamily="Ubuntu, sans-serif" fontSize={12} {...p} />
  const H = (p: React.SVGProps<SVGTextElement>) => <text fill={ink} fontFamily="Jura, sans-serif" fontWeight={700} {...p} />
  return (
    <div className="rounded-2xl border border-sepia-line bg-sepia p-4 font-ui text-sepia-ink">
      <div className="mb-2.5 flex flex-wrap justify-between gap-3">
        <h3 className="font-heading text-lg tracking-[0.04em]">Контора · план этажа</h3>
        <div className="flex flex-wrap gap-3.5 text-[12.5px]">
          <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full border border-sepia-ink bg-[#6f8f4a]" />за работой</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full border border-sepia-ink bg-[#c9962e]" />ждёт решения</span>
          <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full border border-sepia-ink" />отошёл</span>
        </div>
      </div>
      <svg viewBox="0 0 1000 520" className="block h-auto w-full" role="img" aria-label="План офиса: столы dev, Куры и Армана, архив, переговорная и пневмопочта к Inbox">
        <defs>
          <pattern id="ag-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke={line} strokeWidth="1" opacity=".55" /></pattern>
          <pattern id="ag-floor" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="none" stroke={line} strokeWidth=".5" opacity=".35" /></pattern>
        </defs>
        <rect x="10" y="10" width="980" height="500" fill="url(#ag-floor)" stroke={ink} strokeWidth="3" />
        <rect x="16" y="16" width="968" height="488" fill="none" stroke={ink} strokeWidth="1" />
        <path d="M640 16 V200 M640 260 V504 M640 200 H984" stroke={ink} strokeWidth="3" fill="none" />
        <rect x="660" y="30" width="310" height="150" fill="url(#ag-hatch)" stroke={ink} />
        <H x="815" y="100" textAnchor="middle" fontSize="20">АРХИВЪ</H>
        <T x="815" y="124" textAnchor="middle">Wiki · 2 пространства · 41 страница</T>
        <ellipse cx="815" cy="360" rx="120" ry="60" fill="none" stroke={ink} strokeWidth="2" />
        <ellipse cx="815" cy="360" rx="112" ry="53" fill="none" stroke={ink} strokeWidth=".7" />
        <H x="815" y="356" textAnchor="middle" fontSize="16">ПЕРЕГОВОРНАЯ</H>
        <T x="815" y="376" textAnchor="middle">чат-комната · свободна</T>
        <path d="M120 470 C 300 500, 500 440, 620 470" stroke={ink} strokeWidth="6" fill="none" opacity=".8" />
        <path d="M120 470 C 300 500, 500 440, 620 470" stroke={paper} strokeWidth="2.5" fill="none" />
        <circle cx="620" cy="470" r="16" fill={paper} stroke={ink} strokeWidth="2" />
        <H x="620" y="475" textAnchor="middle" fontSize="13">3</H>
        <T x="370" y="500" textAnchor="middle" fontSize={11.5}>пневмопочта → Inbox Славы</T>

        <g transform="translate(60 60)">
          <rect width="220" height="120" rx="6" fill={paper} stroke={ink} strokeWidth="2" />
          <rect x="8" y="8" width="204" height="104" rx="4" fill="none" stroke={ink} strokeWidth=".7" />
          <circle cx="196" cy="24" r="8" fill="#6f8f4a" stroke={ink}><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite" /></circle>
          <H x="20" y="34" fontSize="20">dev</H>
          <T x="20" y="56">стол разработки</T>
          <line x1="20" y1="70" x2="200" y2="70" stroke={line} />
          <T x="20" y="90" fontSize={12.5}>Приложение Agents</T>
          <rect x="20" y="98" width="180" height="5" fill="none" stroke={ink} strokeWidth=".7" />
          <rect x="20" y="98" width="108" height="5" fill={ink} />
        </g>
        <g transform="translate(340 60)">
          <rect width="240" height="120" rx="6" fill={paper} stroke={ink} strokeWidth="2" />
          <rect x="8" y="8" width="224" height="104" rx="4" fill="none" stroke={ink} strokeWidth=".7" />
          <circle cx="216" cy="24" r="8" fill="#c9962e" stroke={ink} />
          <H x="20" y="34" fontSize="20">Кура</H>
          <T x="20" y="56">приёмная · телефон и почта</T>
          <line x1="20" y1="70" x2="220" y2="70" stroke={line} />
          <T x="20" y="90" fontSize={12.5}>КП №214 ждёт подписи</T>
          <T x="20" y="106" fontSize={11} opacity={0.8}>карусель SMM · 3 из 8</T>
        </g>
        <g transform="translate(60 250)">
          <rect width="220" height="120" rx="6" fill={paper} stroke={ink} strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="196" cy="24" r="8" fill="none" stroke={ink} />
          <H x="20" y="34" fontSize="20">Арман</H>
          <T x="20" y="56">кабинет рекламы</T>
          <line x1="20" y1="70" x2="200" y2="70" stroke={line} />
          <T x="20" y="90" fontSize={12.5}>Отошёл · 1 ч назад</T>
          <T x="20" y="106" fontSize={11} opacity={0.8}>оставил: Директ «Bilem» на апрув</T>
        </g>
        <g transform="translate(340 250)">
          <rect width="240" height="120" rx="6" fill="none" stroke={line} strokeWidth="1.5" strokeDasharray="3 5" />
          <H x="120" y="56" textAnchor="middle" fontSize="16" fontWeight={500} opacity={0.75}>свободный стол</H>
          <T x="120" y="78" textAnchor="middle" opacity={0.75}>+ нанять агента</T>
        </g>
        <path d="M640 200 A 60 60 0 0 1 700 260" stroke={ink} fill="none" strokeDasharray="3 3" />
        <g transform="translate(940 470)">
          <circle r="18" fill="none" stroke={ink} />
          <path d="M0 -16 L4 0 L0 16 L-4 0 Z" fill={ink} />
          <H y="-22" textAnchor="middle" fontSize="11" fontWeight={500}>С</H>
        </g>
      </svg>
      <p className="mt-2.5 text-[12.5px] opacity-80">Черновой план: в живой версии — иллюстрации столов в стиле Steampunk Victorian engraving, клик по столу открывает агента.</p>
    </div>
  )
}
