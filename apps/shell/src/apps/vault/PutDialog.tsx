import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { AgentId } from '../inbox/data'
import { agents } from '../inbox/data'
import { Chip } from '../inbox/parts'
import { services, type Kind } from './data'
import { useVault } from './store'

const field = 'flex flex-col gap-1.5 font-ui text-[13px]'
const input = 'rounded-lg border border-line bg-bg px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-accent'

/** vault.put (только Слава). mode=replace — заменить значение существующего секрета. */
export function PutDialog({ open, onOpenChange, replace }: { open: boolean; onOpenChange: (v: boolean) => void; replace?: string }) {
  const put = useVault((s) => s.put)
  const rotate = useVault((s) => s.rotate)
  const [name, setName] = useState('')
  const [service, setService] = useState(services[0].id)
  const [kind, setKind] = useState<Kind>('bearer')
  const [description, setDescription] = useState('')
  const [limit, setLimit] = useState('100 / сут')
  const [agent, setAgent] = useState<AgentId | ''>('')
  const [hasValue, setHasValue] = useState(false)

  const valid = hasValue && (replace || /^[A-Z][A-Z0-9_]{2,}$/.test(name))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    if (replace) rotate(replace)
    else put({ name, service, kind, description, limit, agent: agent || undefined })
    setHasValue(false)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100%-32px)] w-[min(520px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-pop"
        >
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <Dialog.Title className="font-heading text-xl font-semibold">{replace ? 'Заменить значение' : 'Новый секрет'}</Dialog.Title>
              <Chip tone="accent">vault.put · только Слава</Chip>
              <Dialog.Close className="ml-auto rounded-lg border border-line p-1 hover:bg-hover" aria-label="Закрыть"><X size={15} /></Dialog.Close>
            </div>
            {replace ? (
              <p className="m-0 font-mono text-sm">{replace}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className={field}>Имя<input id="vault-name" className={`${input} font-mono`} value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="ZADARMA_API" /></label>
                  <label className={field}>Сервис
                    <select id="vault-service" className={input} value={service} onChange={(e) => setService(e.target.value)}>
                      {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                </div>
                <label className={field}>Описание<input id="vault-desc" className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Зачем и кому этот ключ" /></label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className={field}>Тип
                    <select id="vault-kind" className={input} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                      {(['bearer', 'header', 'basic', 'query'] as Kind[]).map((k) => <option key={k}>{k}</option>)}
                    </select>
                  </label>
                  <label className={field}>Лимит<input id="vault-limit" className={input} value={limit} onChange={(e) => setLimit(e.target.value)} /></label>
                </div>
              </>
            )}
            <label className={field}>Значение
              {/* Демо: значение не сохраняется вовсе — фиксируем только факт, что поле заполнено. */}
              <input
                id="vault-value"
                type="password"
                autoComplete="off"
                className={`${input} font-mono`}
                placeholder="вставьте ключ — он не покажется больше никогда"
                onChange={(e) => setHasValue(e.target.value.length > 0)}
              />
            </label>
            <p className="m-0 font-ui text-xs text-muted">
              Шифруется мастер-ключом из <code className="font-mono">/etc/homeos/env</code> до записи в базу. После сохранения значение видит только Vault в момент вызова.
            </p>
            {!replace ? (
              <label className={field}>Кому доступ
                <select id="vault-agent" className={input} value={agent} onChange={(e) => setAgent(e.target.value as AgentId | '')}>
                  <option value="">никому пока</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
            ) : null}
            <div className="flex justify-end gap-2">
              <Dialog.Close className="rounded-lg border border-line px-3 py-1.5 font-ui text-[13px] font-medium hover:bg-hover">Отмена</Dialog.Close>
              <button type="submit" disabled={!valid} className="rounded-lg border border-accent bg-accent px-3 py-1.5 font-ui text-[13px] font-medium text-accent-text disabled:opacity-50">
                {replace ? 'Зашифровать и заменить' : 'Зашифровать и сохранить'}
              </button>
            </div>
            <p className="m-0 font-ui text-xs text-muted">Демо: значение никуда не отправляется и не хранится.</p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
