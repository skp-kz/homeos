// ДЕМО-данные Inbox (заглушка до services/api): условные сообщения агентов, апрувы и алерты.
// Формы данных — те, что потом придут с бэкенда; содержимое — по мотивам реальной работы.

export type AgentId = 'dev' | 'kura' | 'arman'
export type Presence = 'online' | 'waiting' | 'offline'

export type Agent = {
  id: AgentId
  name: string
  initial: string
  role: string
  presence: Presence
  /** Что делает сейчас / когда был. */
  status: string
}

export type Kind = 'approval' | 'message' | 'alert'
export type Decision = 'approved' | 'declined' | 'snoozed'

export type InboxItem = {
  id: string
  kind: Kind
  /** Агент или системный источник (мониторинг). */
  from: AgentId | 'monitoring'
  project: string
  title: string
  preview: string
  /** Полный текст сообщения агента. */
  body: string
  attachment?: string
  /** Минут назад — для подписи «2 мин / 1 ч / вчера». */
  ageMin: number
  unread: boolean
  /** Подписи кнопок решения, если это апрув. */
  approveLabel?: string
}

export const agents: Agent[] = [
  { id: 'dev', name: 'dev', initial: 'D', role: 'Claude Code · homeos', presence: 'online', status: 'Пишет приложения HomeOS' },
  { id: 'kura', name: 'Кура', initial: 'К', role: 'OpenClaw · офис-менеджер', presence: 'waiting', status: 'Ждёт апрув · КП Зимину' },
  { id: 'arman', name: 'Арман', initial: 'А', role: 'Hermes · маркетинг', presence: 'offline', status: 'Был 1 ч назад' },
]

export const favorites = ['Minidesk', 'Bilem', 'HomeOS', 'Homelab', 'Клиенты / Зимин']

export const items: InboxItem[] = [
  {
    id: 'kp-214',
    kind: 'approval',
    from: 'kura',
    project: 'Клиенты / Зимин',
    title: 'Отправить КП Зимину?',
    preview: 'В WhatsApp бухгалтеру, 1 240 000 ₸, 14 дней',
    body:
      'Слава, КП для Зимина готово по итогам встречи 10.10: обслуживание 12 рабочих мест и сервер 1С, 1 240 000 ₸ в месяц, действует 14 дней. Отправлю в WhatsApp его бухгалтеру, копию — Зимину на почту.',
    attachment: 'КП-214-Зимин.pdf · 2 стр · 184 КБ',
    ageMin: 18,
    unread: true,
    approveLabel: 'Разрешить и отправить',
  },
  {
    id: 'push-minidesk',
    kind: 'approval',
    from: 'dev',
    project: 'Minidesk',
    title: 'git push origin main',
    preview: 'minidesk: журнал и CLAUDE.md, 2 коммита',
    body:
      'Готов запушить в main два коммита: запись в docs/journal.md и правило в CLAUDE.md. Push в main запускает деплой через GitHub Actions.',
    attachment: 'docs/journal.md +14 −0 · CLAUDE.md +3 −1',
    ageMin: 2,
    unread: true,
    approveLabel: 'Разрешить push',
  },
  {
    id: 'direct-bilem',
    kind: 'approval',
    from: 'arman',
    project: 'Bilem',
    title: 'Запустить Директ «Bilem»',
    preview: 'Кампания «бухгалтерия 1С», 15 000 ₸/день',
    body:
      'Кампания «Bilem — бухгалтерия 1С» собрана: 3 объявления, 42 ключевые фразы, Алматы и Астана, бюджет 15 000 ₸ в день. Запускаю после твоего «да».',
    ageMin: 60,
    unread: true,
    approveLabel: 'Запустить',
  },
  {
    id: 'backup-otrar',
    kind: 'alert',
    from: 'monitoring',
    project: 'Клиенты / Отрар',
    title: 'Бэкап «Отрар» не прошёл',
    preview: 'Effector: вторая ночь без успешного бэкапа',
    body:
      'Ночной бэкап Effector у «Отрар» завершился ошибкой второй раз подряд (диск назначения недоступен). Кура уже написала админу клиента.',
    ageMin: 180,
    unread: true,
  },
  {
    id: 'shell-live',
    kind: 'message',
    from: 'dev',
    project: 'HomeOS',
    title: 'Рельса приложений выложена',
    preview: 'os.skp.kz: ⌘K, ⌘1…5, темы',
    body: 'Оболочка HomeOS с рельсой приложений работает на os.skp.kz: ⌘K — палитра, ⌘1…5 — приложения, три темы.',
    ageMin: 240,
    unread: false,
  },
  {
    id: 'meeting-zimin',
    kind: 'message',
    from: 'kura',
    project: 'Клиенты / Зимин',
    title: 'Встреча «Зимин 10.10»',
    preview: 'Записала в базу знаний, 4 задачи в Канбан',
    body: 'Записала встречу «Зимин 10.10» в базу знаний, вынесла 4 задачи в Канбан и поставила напоминание о КП.',
    ageMin: 1300,
    unread: false,
  },
  {
    id: 'seo-tz',
    kind: 'message',
    from: 'arman',
    project: 'Minidesk',
    title: 'ТЗ на 3 статьи для skp.kz',
    preview: 'Темы, ключи и структура готовы',
    body: 'ТЗ на 3 статьи для блога skp.kz готово: темы, ключевые запросы, структура и внутренние ссылки. Жду, кому отдать на написание.',
    ageMin: 1500,
    unread: false,
  },
]

export function age(min: number): string {
  if (min < 60) return `${min} мин`
  if (min < 24 * 60) return `${Math.round(min / 60)} ч`
  return 'вчера'
}
