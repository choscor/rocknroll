import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '../../state/app-store-context'
import type { ProviderId } from '../../domain/contracts'

const providers: ProviderId[] = ['claude', 'codex']

export const SettingsPage = () => {
  const { state, actions } = useAppStore()
  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>({
    claude: '',
    codex: '',
  })

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage provider connections, model preferences, and editor settings.
        </p>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Provider Connections</CardTitle>
            <CardDescription>
              Connect authentication providers with OAuth or API keys.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {providers.map((provider) => {
              const status = state.providerStatuses[provider]

              return (
                <Card key={provider} className="rounded-xl border bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {provider.toUpperCase()}
                      <Badge variant={status.connected ? 'default' : 'outline'}>
                        {status.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {status.authMode ? `Mode: ${status.authMode}` : 'Not connected yet'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="text-xs text-muted-foreground">
                      Credential: {status.maskedCredential ?? 'None'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void actions.connectOAuth(provider)}
                      >
                        Connect OAuth
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void actions.disconnect(provider)}
                      >
                        Disconnect
                      </Button>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor={`api-key-${provider}`} className="text-xs text-muted-foreground">
                        API key
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`api-key-${provider}`}
                          type="password"
                          value={apiKeys[provider]}
                          onChange={(event) =>
                            setApiKeys((prev) => ({ ...prev, [provider]: event.target.value }))
                          }
                          placeholder="Paste provider API key"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            void actions.setApiKey(provider, apiKeys[provider])
                            setApiKeys((prev) => ({ ...prev, [provider]: '' }))
                          }}
                        >
                          Save API key
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Model Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Default Model</label>
              <Select
                value={state.modelConfig.modelId}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  const options = {
                    'claude-opus-4-6': 'Claude Opus 4.6',
                    'claude-sonnet-4-6': 'Claude Sonnet 4.6',
                    'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
                  } as const

                  actions.updateModelConfig({
                    ...state.modelConfig,
                    modelId: value,
                    modelDisplayName: options[value as keyof typeof options] ?? value,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-opus-4-6">Claude Opus 4.6</SelectItem>
                  <SelectItem value="claude-sonnet-4-6">Claude Sonnet 4.6</SelectItem>
                  <SelectItem value="claude-haiku-4-5-20251001">Claude Haiku 4.5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Default Effort</label>
              <Select
                value={state.modelConfig.effort}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  actions.updateModelConfig({
                    ...state.modelConfig,
                    effort: value as 'low' | 'medium' | 'high' | 'extra-high',
                  })
                }}
              >
                <SelectTrigger className="capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="extra-high">Extra High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Execution Mode</label>
              <Select
                value={state.settings.executionMode}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  actions.updateSettings({
                    ...state.settings,
                    executionMode: value as 'local' | 'remote',
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Default Permissions</label>
              <Select
                value={state.settings.defaultPermissions}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  actions.updateSettings({
                    ...state.settings,
                    defaultPermissions: value,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ask">Ask</SelectItem>
                  <SelectItem value="auto">Auto-approve</SelectItem>
                  <SelectItem value="deny">Deny by default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Preferred Editor</label>
              <Select
                value={state.settings.preferredEditor}
                onValueChange={(value) => {
                  if (!value) {
                    return
                  }

                  actions.updateSettings({
                    ...state.settings,
                    preferredEditor: value,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vscode">VS Code</SelectItem>
                  <SelectItem value="cursor">Cursor</SelectItem>
                  <SelectItem value="xcode">Xcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
