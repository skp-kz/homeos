// HomeOS: "fold all" for the sidebar tree. The first click snapshots every
// persisted expansion set (open spaces + per-space expanded page nodes) and
// collapses them all; the second click restores that snapshot exactly. The
// snapshot lives in localStorage so the toggle survives a reload. Tree hooks
// re-read their storage on TREE_FOLD_EVENT.
const SPACES_KEY = 'tela.sidebar.expandedSpaces'
const NODES_PREFIX = 'tela.expanded.'
const SNAPSHOT_KEY = 'homeos.sidebar.foldSnapshot'
const TREE_FOLD_EVENT = 'homeos:tree-fold'

type Snapshot = Record<string, string>

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function treeKeys(ls: Storage): string[] {
  const keys: string[] = []
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i)
    if (k && (k === SPACES_KEY || k.startsWith(NODES_PREFIX))) keys.push(k)
  }
  return keys
}

export function isTreeFolded(): boolean {
  return storage()?.getItem(SNAPSHOT_KEY) != null
}

function emit() {
  window.dispatchEvent(new CustomEvent(TREE_FOLD_EVENT))
}

export function toggleTreeFold(): void {
  const ls = storage()
  if (!ls) return
  try {
    const raw = ls.getItem(SNAPSHOT_KEY)
    if (raw == null) {
      const snap: Snapshot = {}
      for (const k of treeKeys(ls)) {
        snap[k] = ls.getItem(k) ?? '[]'
        ls.setItem(k, '[]')
      }
      ls.setItem(SNAPSHOT_KEY, JSON.stringify(snap))
    } else {
      const snap = JSON.parse(raw) as Snapshot
      for (const k of treeKeys(ls)) ls.setItem(k, snap[k] ?? '[]')
      for (const [k, v] of Object.entries(snap)) ls.setItem(k, v)
      ls.removeItem(SNAPSHOT_KEY)
    }
  } catch {
    // Quota / privacy mode — leave the tree as it is.
  }
  emit()
}

export function subscribeToTreeFold(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(TREE_FOLD_EVENT, cb)
  return () => window.removeEventListener(TREE_FOLD_EVENT, cb)
}
