import { useState } from 'react'
import { useAppStore } from '../../state/app-store-context'
import type { ProviderId } from '../../domain/contracts'
import './settings-page.css'

const providers: ProviderId[] = ['claude', 'codex']

export const SettingsPage = () => {
  const { state, actions } = useAppStore()
  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>({
    claude: '',
    codex: '',
  })

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <p>Manage provider connections, model preferences, and editor settings.</p>

      <div className="settings-section">
        <h3>Provider Connections</h3>
        <div className="settings-grid">
          {providers.map((provider) => {
            const status = state.providerStatuses[provider]
            return (
              <div className="settings-card" key={provider}>
                <h4>{provider.toUpperCase()}</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: status.connected ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                    color: status.connected ? '#4ade80' : '#f87171',
                  }}>
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </span>
                  <small>{status.authMode ? `Mode: ${status.authMode}` : ''}</small>
                </div>
                <small>Credential: {status.maskedCredential ?? 'None'}</small>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => void actions.connectOAuth(provider)}
                    style={{
                      padding: '5px 10px',
                      background: '#4a9eff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Connect OAuth
                  </button>
                  <button
                    type="button"
                    onClick={() => void actions.disconnect(provider)}
                    style={{
                      padding: '5px 10px',
                      background: 'transparent',
                      color: '#a0a0b8',
                      border: '1px solid #2a2a45',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Disconnect
                  </button>
                </div>
                <div className="settings-field">
                  <label htmlFor={`api-key-${provider}`}>API key</label>
                  <input
                    id={`api-key-${provider}`}
                    type="password"
                    value={apiKeys[provider]}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))
                    }
                    placeholder="Paste provider API key"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void actions.setApiKey(provider, apiKeys[provider])
                      setApiKeys((prev) => ({ ...prev, [provider]: '' }))
                    }}
                    style={{
                      padding: '5px 10px',
                      background: '#1e1e38',
                      color: '#e0e0e8',
                      border: '1px solid #2a2a45',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Save API key
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="settings-section">
        <h3>Model Configuration</h3>
        <div className="settings-grid">
          <div className="settings-field">
            <label>Default Model</label>
            <select
              value={state.modelConfig.modelId}
              onChange={(e) => actions.updateModelConfig({
                ...state.modelConfig,
                modelId: e.target.value,
                modelDisplayName: e.target.options[e.target.selectedIndex].text,
              })}
            >
              <option value="claude-opus-4-6">Claude Opus 4.6</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
            </select>
          </div>
          <div className="settings-field">
            <label>Default Effort</label>
            <select
              value={state.modelConfig.effort}
              onChange={(e) => actions.updateModelConfig({
                ...state.modelConfig,
                effort: e.target.value as 'low' | 'medium' | 'high' | 'extra-high',
              })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="extra-high">Extra High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="settings-grid">
          <div className="settings-field">
            <label>Execution Mode</label>
            <select
              value={state.settings.executionMode}
              onChange={(e) => actions.updateSettings({
                ...state.settings,
                executionMode: e.target.value as 'local' | 'remote',
              })}
            >
              <option value="local">Local</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div className="settings-field">
            <label>Default Permissions</label>
            <select
              value={state.settings.defaultPermissions}
              onChange={(e) => actions.updateSettings({
                ...state.settings,
                defaultPermissions: e.target.value,
              })}
            >
              <option value="ask">Ask</option>
              <option value="auto">Auto-approve</option>
              <option value="deny">Deny by default</option>
            </select>
          </div>
          <div className="settings-field">
            <label>Preferred Editor</label>
            <select
              value={state.settings.preferredEditor}
              onChange={(e) => actions.updateSettings({
                ...state.settings,
                preferredEditor: e.target.value,
              })}
            >
              <option value="vscode">VS Code</option>
              <option value="cursor">Cursor</option>
              <option value="xcode">Xcode</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
