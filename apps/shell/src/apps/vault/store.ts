import { create } from 'zustand'
import type { AgentId } from '../inbox/data'
import { secrets as demo, type Kind, type Secret } from './data'

type NewSecret = { name: string; service: string; kind: Kind; description: string; limit: string; agent?: AgentId }

type VaultState = {
  secrets: Secret[]
  /** Демо vault.put: значение не сохраняется вовсе — только метаданные. */
  put: (s: NewSecret) => void
  rotate: (name: string) => void
  revoke: (name: string, agent: AgentId) => void
}

export const useVault = create<VaultState>()((set) => ({
  secrets: demo,
  put: (s) =>
    set((st) => ({
      secrets: [
        {
          name: s.name,
          service: s.service,
          kind: s.kind,
          description: s.description,
          createdBy: 'Слава',
          createdAt: 'сегодня',
          rotatedDaysAgo: 0,
          calls24h: 0,
          limit: s.limit,
          limitUsed: 0,
          grants: s.agent ? [{ agent: s.agent, methods: 'GET', path: '/*' }] : [],
        },
        ...st.secrets.filter((x) => x.name !== s.name),
      ],
    })),
  rotate: (name) =>
    set((st) => ({ secrets: st.secrets.map((x) => (x.name === name ? { ...x, rotatedDaysAgo: 0, expiresInDays: undefined } : x)) })),
  revoke: (name, agent) =>
    set((st) => ({ secrets: st.secrets.map((x) => (x.name === name ? { ...x, grants: x.grants.filter((g) => g.agent !== agent) } : x)) })),
}))
