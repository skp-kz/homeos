import { Command } from 'cmdk'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { Moon, PanelLeft, RotateCw, Sun } from 'lucide-react'
import type { AppDef } from '../registry'
import { useShell } from '../store'
import { modKey } from './Rail'

// Глобальная палитра ⌘K. Сейчас: приложения + команды оболочки. Дальше сюда же — страницы
// Wiki, агенты, секреты по имени (отдельные Command.Group с асинхронными источниками).
export function CommandPalette({ apps, onOpen }: { apps: AppDef[]; onOpen: (app: AppDef) => void }) {
  const open = useShell((s) => s.paletteOpen)
  const setOpen = useShell((s) => s.setPaletteOpen)
  const theme = useShell((s) => s.theme)
  const toggleTheme = useShell((s) => s.toggleTheme)
  const toggleSidebar = useShell((s) => s.toggleSidebar)

  const run = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed top-[18vh] left-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.14 }}
              >
                <Dialog.Title className="sr-only">Палитра команд</Dialog.Title>
                <Command label="Палитра команд" loop>
                  <Command.Input
                    autoFocus
                    placeholder="Приложение или команда…"
                    className="w-full border-b border-line bg-transparent px-4 py-3 text-[15px] text-text outline-none placeholder:text-muted"
                  />
                  <Command.List className="max-h-[50vh] overflow-y-auto p-1.5">
                    <Command.Empty className="px-3 py-6 text-center text-sm text-muted">Ничего не найдено</Command.Empty>
                    <Command.Group heading="Приложения">
                      {apps.map((app, i) => {
                        const Icon = app.icon
                        return (
                          <Item key={app.id} value={`app ${app.title} ${app.id}`} onSelect={run(() => onOpen(app))}
                            icon={<Icon size={16} />} label={app.title} hint={i < 9 ? `${modKey}${i + 1}` : undefined} />
                        )
                      })}
                    </Command.Group>
                    <Command.Group heading="Команды">
                      <Item value="theme тема" onSelect={run(toggleTheme)}
                        icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'} />
                      <Item value="sidebar сайдбар панель" onSelect={run(toggleSidebar)}
                        icon={<PanelLeft size={16} />} label="Показать/скрыть сайдбар" hint={`${modKey}\\`} />
                      <Item value="reload перезагрузить" onSelect={run(() => location.reload())}
                        icon={<RotateCw size={16} />} label="Перезагрузить оболочку" />
                    </Command.Group>
                  </Command.List>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function Item({ value, onSelect, icon, label, hint }: {
  value: string
  onSelect: () => void
  icon: React.ReactNode
  label: string
  hint?: string
}) {
  return (
    <Command.Item value={value} onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text">
      <span className="text-muted">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint ? <kbd className="font-mono text-[11px] text-muted">{hint}</kbd> : null}
    </Command.Item>
  )
}
