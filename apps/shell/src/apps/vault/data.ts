// ДЕМО-данные Vault (заглушка до services/api, схема `vault`). Значений секретов здесь нет и не будет:
// UI Vault работает только с именами, гранты и журналом — так же, как агенты.
import type { AgentId } from '../inbox/data'

export type Kind = 'bearer' | 'header' | 'basic' | 'query'

export type Service = { id: string; name: string; mark: string; color: string; baseUrl: string; inject: string; how: string }

export const services: Service[] = [
  { id: 'minidesk', name: 'Minidesk', mark: 'M', color: '#3a2a1a', baseUrl: 'https://minidesk.skp.kz', how: 'заголовок Bearer', inject: 'Authorization: Bearer ‹KEY›' },
  { id: 'zadarma', name: 'Zadarma', mark: 'Z', color: '#b4543a', baseUrl: 'https://api.zadarma.com', how: 'кастомный заголовок', inject: 'Authorization: ‹key›:‹подпись запроса›' },
  { id: 'meta', name: 'Meta Graph', mark: 'f', color: '#3b5998', baseUrl: 'https://graph.facebook.com/v23.0', how: 'query-параметр', inject: '?access_token=‹KEY›' },
  { id: 'gads', name: 'Google Ads', mark: 'G', color: '#4f7a3a', baseUrl: 'https://googleads.googleapis.com', how: 'заголовок', inject: 'developer-token: ‹KEY›' },
  { id: 'github', name: 'GitHub', mark: 'gh', color: '#24292f', baseUrl: 'https://api.github.com', how: 'заголовок Bearer', inject: 'Authorization: Bearer ‹KEY›' },
  { id: 'tela', name: 'Tela', mark: 'T', color: '#8a7560', baseUrl: 'http://127.0.0.1:8781', how: 'заголовок Bearer', inject: 'Authorization: Bearer ‹KEY›' },
  { id: 'openai', name: 'OpenAI', mark: 'O', color: '#c08a2a', baseUrl: 'https://api.openai.com', how: 'заголовок Bearer', inject: 'Authorization: Bearer ‹KEY›' },
]

export type Grant = { agent: AgentId; methods: string; path: string; approval?: string }

export type Secret = {
  name: string
  service: string
  kind: Kind
  description: string
  createdBy: string
  createdAt: string
  /** Дней с последней ротации; null — истекает (см. expiresInDays). */
  rotatedDaysAgo: number
  expiresInDays?: number
  calls24h: number
  limit: string
  /** Использовано из лимита, 0..1 — для полоски. */
  limitUsed: number
  grants: Grant[]
}

export const secrets: Secret[] = [
  { name: 'MINIDESK_API_KEY', service: 'minidesk', kind: 'bearer', description: 'API Minidesk для дежурного dev вместо файла ключа на VM', createdBy: 'Слава', createdAt: '29.09', rotatedDaysAgo: 12, calls24h: 184, limit: '600 / ч', limitUsed: 0.31, grants: [{ agent: 'dev', methods: 'GET POST', path: '/api/*' }] },
  { name: 'MINIDESK_KURA_KEY', service: 'minidesk', kind: 'bearer', description: 'Заявки, КП, KB Meetings', createdBy: 'Слава', createdAt: '29.09', rotatedDaysAgo: 12, calls24h: 96, limit: '300 / ч', limitUsed: 0.2, grants: [{ agent: 'kura', methods: 'GET POST', path: '/api/leads|kp|kb/*' }] },
  { name: 'ZADARMA_API', service: 'zadarma', kind: 'header', description: 'Звонки и городской номер', createdBy: 'Слава', createdAt: '01.09', rotatedDaysAgo: 40, calls24h: 31, limit: '100 / сут', limitUsed: 1, grants: [{ agent: 'kura', methods: 'GET', path: '/v1/statistics/*' }] },
  { name: 'META_PAGE_TOKEN', service: 'meta', kind: 'query', description: 'Страница СКП: статистика, посты', createdBy: 'Слава', createdAt: '13.08', rotatedDaysAgo: 57, expiresInDays: 3, calls24h: 58, limit: '200 / сут', limitUsed: 0.29, grants: [{ agent: 'arman', methods: 'GET', path: '/{page}/insights', approval: 'POST /feed' }] },
  { name: 'GOOGLE_ADS_DEV_TOKEN', service: 'gads', kind: 'header', description: 'Кампании и отчёты', createdBy: 'Слава', createdAt: '01.08', rotatedDaysAgo: 71, calls24h: 22, limit: '500 / сут', limitUsed: 0.04, grants: [{ agent: 'arman', methods: 'GET', path: 'reports/*', approval: 'mutate' }] },
  { name: 'GITHUB_HOMEOS_TOKEN', service: 'github', kind: 'bearer', description: 'Только skp-kz/homeos, без force-push', createdBy: 'Слава', createdAt: '06.10', rotatedDaysAgo: 5, calls24h: 9, limit: '300 / ч', limitUsed: 0.03, grants: [{ agent: 'dev', methods: 'GET POST', path: '/repos/skp-kz/homeos/*' }] },
  { name: 'TELA_PAT_AGENTS', service: 'tela', kind: 'bearer', description: 'Wiki: чтение всем, запись dev и Куре', createdBy: 'Слава', createdAt: '11.10', rotatedDaysAgo: 0, calls24h: 7, limit: '1000 / ч', limitUsed: 0.01, grants: [{ agent: 'dev', methods: 'все', path: '/api/*' }, { agent: 'kura', methods: 'все', path: '/api/*' }, { agent: 'arman', methods: 'GET', path: 'только чтение' }] },
  { name: 'OPENAI_ARMAN', service: 'openai', kind: 'bearer', description: 'Тексты и анализ для маркетинга', createdBy: 'Слава', createdAt: '21.09', rotatedDaysAgo: 20, calls24h: 5, limit: '$5 / сут', limitUsed: 0.12, grants: [{ agent: 'arman', methods: 'POST', path: '/v1/responses' }] },
]

export type Call = { time: string; agent: AgentId; secret: string; req: string; status: number; note?: { text: string; tone: 'warn' | 'bad' | 'accent' }; size: string }

export const audit: Call[] = [
  { time: '14:22:08', agent: 'dev', secret: 'MINIDESK_API_KEY', req: 'GET /api/kanban?assignee=dev', status: 200, size: '4,1 КБ' },
  { time: '14:19:51', agent: 'kura', secret: 'MINIDESK_KURA_KEY', req: 'POST /api/kp/214/pdf', status: 201, size: '184 КБ' },
  { time: '14:12:30', agent: 'arman', secret: 'META_PAGE_TOKEN', req: 'GET /me?fields=id,name', status: 200, note: { text: 'redacted: 1', tone: 'warn' }, size: '0,2 КБ' },
  { time: '14:05:12', agent: 'dev', secret: 'MINIDESK_API_KEY', req: 'POST /api/agents/heartbeat', status: 200, size: '0,1 КБ' },
  { time: '13:58:02', agent: 'kura', secret: 'ZADARMA_API', req: 'GET /v1/statistics/?start=…', status: 200, size: '12 КБ' },
  { time: '13:51:40', agent: 'dev', secret: 'MINIDESK_API_KEY', req: 'POST /api/agents/done', status: 200, size: '0,3 КБ' },
  { time: '13:40:17', agent: 'arman', secret: 'MINIDESK_API_KEY', req: 'GET /api/leads', status: 403, note: { text: 'нет гранта', tone: 'bad' }, size: '—' },
  { time: '13:02:44', agent: 'dev', secret: 'GITHUB_HOMEOS_TOKEN', req: 'POST /repos/skp-kz/homeos/pulls', status: 201, size: '2,3 КБ' },
  { time: '12:47:10', agent: 'arman', secret: 'GOOGLE_ADS_DEV_TOKEN', req: 'POST …/campaigns:mutate', status: 202, note: { text: 'ждёт апрув', tone: 'accent' }, size: '—' },
  { time: '11:31:05', agent: 'kura', secret: 'ZADARMA_API', req: 'GET /v1/info/balance', status: 429, note: { text: 'лимит 100/сут', tone: 'bad' }, size: '—' },
]

/** Вызовы по часам за последние 14 ч — для мини-графика в карточке (демо). */
export const hourly = [20, 15, 10, 8, 6, 12, 25, 40, 55, 48, 62, 70, 58, 92]

export const uncovered = ['ssh-ключи и пароли RDP', 'SMTP в 1С', 'пароли WebDAV Куры']
