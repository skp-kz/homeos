import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

type ShellState = {
  theme: Theme
  paletteOpen: boolean
  /** Последний открытый путь каждого приложения — переключение возвращает туда, где был. */
  lastPath: Record<string, string>
  /** Счётчик-«толчок» для сворачивания сайдбара активного приложения (⌘\ и кнопка). */
  sidebarToggle: number
  /** Тема Wiki (tela): от неё зависит цвет знака HomeOS в рельсе и во вкладке. */
  wikiTheme: string
  setWikiTheme: (t: string) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setPaletteOpen: (open: boolean) => void
  togglePalette: () => void
  rememberPath: (appId: string, path: string) => void
  toggleSidebar: () => void
}

const systemTheme = (): Theme =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useShell = create<ShellState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      paletteOpen: false,
      lastPath: {},
      sidebarToggle: 0,
      wikiTheme: 'light',
      setWikiTheme: (wikiTheme) => set({ wikiTheme }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
      rememberPath: (appId, path) =>
        set((s) => (s.lastPath[appId] === path ? s : { lastPath: { ...s.lastPath, [appId]: path } })),
      toggleSidebar: () => set((s) => ({ sidebarToggle: s.sidebarToggle + 1 })),
    }),
    {
      name: 'homeos.shell',
      partialize: (s) => ({ theme: s.theme, lastPath: s.lastPath, wikiTheme: s.wikiTheme }),
    },
  ),
)
