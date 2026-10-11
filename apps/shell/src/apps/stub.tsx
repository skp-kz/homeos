import type { AppViewProps } from '../registry'

// Заглушки для приложений, у которых ещё нет экрана: только механика (сайдбар есть, контента нет).
export function StubSidebar({ app }: AppViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted">{app.title}</div>
      <div className="px-4 text-sm text-muted">Пока пусто</div>
    </div>
  )
}

export function StubView({ app }: AppViewProps) {
  const Icon = app.icon
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted">
      <Icon size={40} strokeWidth={1.25} aria-hidden />
      <div className="text-lg text-text">{app.title}</div>
      <div className="text-sm">скоро</div>
    </div>
  )
}
