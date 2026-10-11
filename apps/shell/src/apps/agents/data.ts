// ДЕМО-данные Agents (заглушка до подключения runner Minidesk /api/agents/state).
import type { AgentId } from '../inbox/data'

export type RunState = 'inbox' | 'claimed' | 'working' | 'verify' | 'human' | 'done'

export type Task = {
  id: string
  title: string
  agent: AgentId
  project: string
  state: RunState
  /** Прогресс шагов, если идёт работа. */
  steps?: [number, number]
  cost?: string
  note?: string
}

export const columns: { id: RunState; title: string }[] = [
  { id: 'inbox', title: 'Inbox' },
  { id: 'claimed', title: 'Claimed' },
  { id: 'working', title: 'Working' },
  { id: 'verify', title: 'Verify' },
  { id: 'human', title: 'Human' },
  { id: 'done', title: 'Done' },
]

export const tasks: Task[] = [
  { id: 't1', title: 'Перенести docs/ideas/*.md в Wiki через MCP', agent: 'dev', project: 'HomeOS', state: 'inbox', note: '≤ 20 шагов' },
  { id: 't2', title: 'Контент-план ноябрь: 8 постов про 1С-сопровождение', agent: 'arman', project: 'Minidesk', state: 'inbox', note: 'лимит $2' },
  { id: 't3', title: 'Сверить счета «Отрар» за сентябрь', agent: 'kura', project: 'Клиенты', state: 'inbox', note: '≤ 10 шагов' },
  { id: 't4', title: 'SEO-аудит bilem.ai: мета, скорость, индексация', agent: 'arman', project: 'Bilem', state: 'claimed', note: 'взял 4 мин назад' },
  { id: 't5', title: 'Приложение Agents в оболочке HomeOS', agent: 'dev', project: 'HomeOS', state: 'working', steps: [6, 10], cost: '$0.42' },
  { id: 't6', title: 'Карусель «Бэкапы — это скучно, пока…»: фоны и JSON слайдов', agent: 'kura', project: 'Соцсети', state: 'working', steps: [3, 8], note: '♥ 12 мин' },
  { id: 't7', title: 'check_json: /api/version на os.skp.kz отдаёт новый commit', agent: 'dev', project: 'HomeOS', state: 'verify', note: 'автопроверка' },
  { id: 't8', title: 'КП №214 Зимину — отправить?', agent: 'kura', project: 'Клиенты / Зимин', state: 'human' },
  { id: 't9', title: 'Рельса приложений на os.skp.kz', agent: 'dev', project: 'HomeOS', state: 'done' },
  { id: 't10', title: 'Встреча «Зимин 10.10» → KB Meetings', agent: 'kura', project: 'Клиенты', state: 'done' },
  { id: 't11', title: 'ТЗ на 3 статьи для skp.kz', agent: 'arman', project: 'Minidesk', state: 'done' },
]

export type Access = 'yes' | 'ask' | 'no'

export const skills: { group: string; rows: { name: string; source: string; access: Record<AgentId, Access> }[] }[] = [
  {
    group: 'Знания и память',
    rows: [
      { name: 'Wiki: читать и искать', source: 'tela MCP', access: { dev: 'yes', kura: 'yes', arman: 'yes' } },
      { name: 'Wiki: писать страницы', source: 'tela MCP · write', access: { dev: 'yes', kura: 'yes', arman: 'no' } },
      { name: 'KB Meetings', source: 'Minidesk API', access: { dev: 'no', kura: 'yes', arman: 'no' } },
    ],
  },
  {
    group: 'Клиенты и продажи',
    rows: [
      { name: 'Заявки и лиды', source: 'Minidesk API', access: { dev: 'yes', kura: 'yes', arman: 'yes' } },
      { name: 'КП в PDF', source: 'Minidesk /api/kp', access: { dev: 'no', kura: 'yes', arman: 'no' } },
      { name: 'Отправка в WhatsApp', source: 'Baileys · Cloud API', access: { dev: 'no', kura: 'ask', arman: 'ask' } },
      { name: 'Счета', source: 'Minidesk /api/finance', access: { dev: 'no', kura: 'ask', arman: 'no' } },
    ],
  },
  {
    group: 'Маркетинг',
    rows: [
      { name: 'Google Ads / Яндекс Директ', source: 'Ads API', access: { dev: 'no', kura: 'no', arman: 'ask' } },
      { name: 'SEO-аудит и ТЗ', source: 'skill: seo-audit', access: { dev: 'no', kura: 'no', arman: 'yes' } },
      { name: 'Соцсети: фоны и слайды', source: '/api/social', access: { dev: 'no', kura: 'yes', arman: 'yes' } },
      { name: 'Публикация IG / FB', source: 'SMM-конвейер', access: { dev: 'no', kura: 'no', arman: 'ask' } },
    ],
  },
  {
    group: 'Инфраструктура',
    rows: [
      { name: 'Мониторинг бэкапов', source: 'Kuma · Effector', access: { dev: 'yes', kura: 'yes', arman: 'no' } },
      { name: 'git push в main', source: 'GitHub', access: { dev: 'ask', kura: 'no', arman: 'no' } },
      { name: 'Деплой и миграции D1', source: 'wrangler', access: { dev: 'no', kura: 'no', arman: 'no' } },
      { name: 'Секреты', source: 'Vault · только имена', access: { dev: 'yes', kura: 'yes', arman: 'yes' } },
    ],
  },
]

export const duties: Record<AgentId, { title: string; lines: string[]; channel: string }> = {
  dev: { title: 'Разработка · Claude Code', lines: ['Minidesk, сайт, блог, API', 'HomeOS: оболочка и приложения', 'Доки для агентов'], channel: 'VM homeos · openclaw' },
  kura: { title: 'Офис-менеджер · OpenClaw', lines: ['Заявки, КП, счета', 'Бэкапы и алерты клиентов', 'Встречи → KB Meetings'], channel: 'WhatsApp · Telegram' },
  arman: { title: 'Маркетинг · Hermes', lines: ['Google Ads, Яндекс Директ', 'SEO-аудиты и ТЗ', 'Контент-план, статистика Meta'], channel: 'WhatsApp Cloud API' },
}

export type FlowStep = { name: string; who?: AgentId | 'slava'; note: string; gate?: boolean; live?: boolean }

export const flows: { name: string; status: 'active' | 'manual'; meta: string; steps: FlowStep[] }[] = [
  {
    name: 'SMM-конвейер',
    status: 'active',
    meta: 'слоты вт/чт 10:00 · 6 карточек в работе',
    steps: [
      { name: 'Идея', who: 'arman', note: 'с обоснованием' },
      { name: 'Текст и слайды', who: 'kura', note: '48 ч', live: true },
      { name: 'Ревью', who: 'slava', note: 'в Inbox', gate: true },
      { name: 'Одобрено', note: 'ждёт слот' },
      { name: 'Публикация', note: 'cron */10 · IG/FB' },
    ],
  },
  {
    name: 'Заявка → КП',
    status: 'active',
    meta: '12 за месяц · в среднем 3 ч 40 мин',
    steps: [
      { name: 'Заявка', note: 'сайт · WhatsApp · Zadarma' },
      { name: 'Встреча и заметки', who: 'kura', note: '→ KB' },
      { name: 'КП в PDF', who: 'kura', note: 'шаблон КП' },
      { name: 'Отправить?', who: 'slava', note: 'сейчас: Зимин №214', gate: true, live: true },
      { name: 'Отправка и напоминание', who: 'kura', note: 'через 3 дня' },
    ],
  },
  {
    name: 'Код → прод',
    status: 'manual',
    meta: 'последний запуск 4 ч назад',
    steps: [
      { name: 'Карточка Канбана', note: 'agent = dev' },
      { name: 'Код и коммит', who: 'dev', note: 'ветка и тесты' },
      { name: 'Автопроверка', note: 'check_json' },
      { name: 'Push в main', who: 'slava', note: 'апрув в Inbox', gate: true },
      { name: 'Деплой', note: 'GitHub Actions' },
    ],
  },
]

export const projects = [
  { name: 'Minidesk', tasks: 4 },
  { name: 'Bilem', tasks: 2 },
  { name: 'HomeOS', tasks: 3 },
  { name: 'Клиенты / Зимин', tasks: 1, waiting: true },
]
