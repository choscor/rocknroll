import { useMemo, useState } from 'react'
import { useAppStore } from '../../state/AppStoreContext'
import type { ProviderId } from '../../types/contracts'

const providers: ProviderId[] = ['claude', 'codex']

export const ConnectionsPage = () => {
  const { state, actions } = useAppStore()
  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>({
    claude: '',
    codex: '',
  })

  const providerCards = useMemo(
    () =>
      providers.map((provider) => {
        const status = state.providerStatuses[provider]

        return (
          <article className="card" key={provider}>
            <h3>{provider.toUpperCase()}</h3>
            <div className="row">
              <span
                className={`pill ${
                  status.connected ? 'pill-connected' : 'pill-disconnected'
                }`}
              >
                {status.connected ? 'Connected' : 'Disconnected'}
              </span>
              <small>{status.authMode ? `Mode: ${status.authMode}` : 'No auth mode'}</small>
            </div>

            <small>
              Last sync:{' '}
              {status.lastSyncedAt
                ? new Date(status.lastSyncedAt).toLocaleString()
                : 'Never'}
            </small>
            <small>Credential: {status.maskedCredential ?? 'None'}</small>

            <div className="row">
              <button
                className="button-primary"
                type="button"
                onClick={() => void actions.connectOAuth(provider)}
              >
                Connect OAuth
              </button>
              <button
                type="button"
                onClick={() => void actions.disconnect(provider)}
              >
                Disconnect
              </button>
            </div>

            <label htmlFor={`api-key-${provider}`}>API key</label>
            <input
              id={`api-key-${provider}`}
              type="password"
              value={apiKeys[provider]}
              onChange={(event) =>
                setApiKeys((previous) => ({
                  ...previous,
                  [provider]: event.target.value,
                }))
              }
              placeholder="Paste provider API key"
            />
            <button
              type="button"
              onClick={() => {
                void actions.setApiKey(provider, apiKeys[provider])
                setApiKeys((previous) => ({ ...previous, [provider]: '' }))
              }}
            >
              Save API key
            </button>
          </article>
        )
      }),
    [actions, apiKeys, state.providerStatuses],
  )

  return (
    <section className="page">
      <h2>Provider Connections</h2>
      <p>
        Connect Claude and Codex via OAuth or API key. Credentials are mocked in
        memory for this scaffold.
      </p>
      <div className="grid grid-two">{providerCards}</div>
    </section>
  )
}
