import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

// Контракт приложения в доке. Новое приложение = одна запись в apps[] (src/apps.tsx);
// оболочка сама даёт ему иконку в рельсе, ⌘N, пункт в ⌘K, маршрут /<route>/… и
// второй сайдбар (сворачиваемый, ширина запоминается) — если он объявлен.
export type AppDef = {
  id: string
  title: string
  icon: LucideIcon
  /** Корень маршрута приложения, например '/agents'. Всё под ним — вкладки приложения. */
  route: string
  /** Второй сайдбар. Нет — приложение занимает весь экран (Wiki: у tela свой сайдбар). */
  sidebar?: ComponentType<AppViewProps>
  /** Экран приложения. Нет — заглушка «скоро». */
  view?: ComponentType<AppViewProps>
  /** Хук счётчика на иконке в рельсе (например, сколько ждут решения). */
  useBadge?: () => number
}

export type AppViewProps = {
  app: AppDef
  /** Хвост URL внутри приложения: '/agents/dev/tasks' → '/dev/tasks'. */
  subpath: string
  /** Приложение сейчас на экране (неактивные остаются смонтированными, но скрыты). */
  active: boolean
}
