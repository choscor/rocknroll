import type { AuthService } from '../interfaces'
import type {
  ProviderConnectionStatus,
  ProviderId,
} from '../../types/contracts'
import { clone, err, nowIso, ok, type MockDatabase } from './mockDatabase'

const maskApiKey = (apiKey: string): string => {
  const tail = apiKey.slice(-4)
  return `***${tail || 'key'}`
}

export class MockAuthService implements AuthService {
  constructor(private readonly db: MockDatabase) {}

  async listStatuses() {
    const statuses = Object.values(this.db.providers).map((status) => clone(status))
    return ok(statuses)
  }

  async connectOAuth(provider: ProviderId) {
    const current = this.db.providers[provider]
    const updated: ProviderConnectionStatus = {
      ...current,
      connected: true,
      authMode: 'oauth',
      maskedCredential: 'oauth-linked',
      lastSyncedAt: nowIso(),
    }
    this.db.providers[provider] = updated
    return ok(clone(updated))
  }

  async setApiKey(provider: ProviderId, apiKey: string) {
    const value = apiKey.trim()
    if (value.length < 8) {
      return err('INVALID_API_KEY', 'API key must be at least 8 characters long.')
    }

    const current = this.db.providers[provider]
    const updated: ProviderConnectionStatus = {
      ...current,
      connected: true,
      authMode: 'api_key',
      maskedCredential: maskApiKey(value),
      lastSyncedAt: nowIso(),
    }

    this.db.providers[provider] = updated
    return ok(clone(updated))
  }

  async disconnect(provider: ProviderId) {
    const current = this.db.providers[provider]
    const updated: ProviderConnectionStatus = {
      ...current,
      connected: false,
      authMode: null,
      maskedCredential: null,
      lastSyncedAt: nowIso(),
    }

    this.db.providers[provider] = updated
    return ok(clone(updated))
  }
}
