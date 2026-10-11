import { create } from 'zustand'
import { items as demoItems, type Decision, type InboxItem, type Kind } from './data'

export type Folder = 'all' | Kind | 'snoozed'

type InboxState = {
  items: InboxItem[]
  decisions: Record<string, Decision>
  folder: Folder
  setFolder: (f: Folder) => void
  markRead: (id: string) => void
  decide: (id: string, d: Decision) => void
  undo: (id: string) => void
}

// Заглушка: решения живут только в памяти вкладки. С бэкендом здесь будут вызовы API.
export const useInbox = create<InboxState>()((set) => ({
  items: demoItems,
  decisions: {},
  folder: 'all',
  setFolder: (folder) => set({ folder }),
  markRead: (id) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id && it.unread ? { ...it, unread: false } : it)) })),
  decide: (id, d) => set((s) => ({ decisions: { ...s.decisions, [id]: d } })),
  undo: (id) =>
    set((s) => {
      const next = { ...s.decisions }
      delete next[id]
      return { decisions: next }
    }),
}))

export function inFolder(it: InboxItem, folder: Folder, decisions: Record<string, Decision>): boolean {
  const snoozed = decisions[it.id] === 'snoozed'
  if (folder === 'snoozed') return snoozed
  if (snoozed) return false
  return folder === 'all' || it.kind === folder
}

/** Сколько апрувов ждут решения — счётчик на иконке Inbox в рельсе. */
export function usePendingCount(): number {
  return useInbox((s) => s.items.filter((it) => it.kind === 'approval' && !s.decisions[it.id]).length)
}
