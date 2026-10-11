import { BookText, Bot, Inbox, KeyRound, Plug } from 'lucide-react'
import type { AppDef } from './registry'
import { WikiView } from './apps/wiki'
import { StubSidebar } from './apps/stub'

// Док HomeOS. Порядок = ⌘1…⌘9. Новое приложение — одна строка; остальные не меняются.
export const apps: AppDef[] = [
  { id: 'inbox', title: 'Inbox', icon: Inbox, route: '/inbox', sidebar: StubSidebar },
  { id: 'agents', title: 'Agents', icon: Bot, route: '/agents', sidebar: StubSidebar },
  { id: 'wiki', title: 'Wiki', icon: BookText, route: '/wiki', view: WikiView },
  { id: 'vault', title: 'Vault', icon: KeyRound, route: '/vault', sidebar: StubSidebar },
  { id: 'connections', title: 'Connections', icon: Plug, route: '/connections', sidebar: StubSidebar },
]
