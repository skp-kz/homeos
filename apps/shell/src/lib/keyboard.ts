// Глобальные клавиши оболочки. Обработчик ставит Shell; iframe-приложения (Wiki) подключают
// свой document через attachShellKeys — иначе при фокусе внутри iframe ⌘K/⌘1…9 туда бы и уходили.
type Handler = (e: KeyboardEvent) => void

let handler: Handler | null = null

export function setShellKeyHandler(h: Handler | null) {
  handler = h
}

const listener = (e: KeyboardEvent) => handler?.(e)

/** Слушать клавиши в документе (в фазе захвата — раньше хоткеев самого приложения). */
export function attachShellKeys(target: Window | Document): () => void {
  target.addEventListener('keydown', listener as EventListener, true)
  return () => target.removeEventListener('keydown', listener as EventListener, true)
}
