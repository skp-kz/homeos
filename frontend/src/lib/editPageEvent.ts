// HomeOS: "edit the page I'm reading" bus. The `e` key (keymap, any layout) emits
// it; the mounted PageViewer — only while reading, and only for an editor — enters
// edit mode exactly like its Edit button.
const EDIT_PAGE_EVENT = 'homeos:edit-page'

export function emitEditPage(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EDIT_PAGE_EVENT))
}

export function subscribeToEditPage(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(EDIT_PAGE_EVENT, cb)
  return () => window.removeEventListener(EDIT_PAGE_EVENT, cb)
}
