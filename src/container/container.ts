import type { AppServices } from '../repository/interfaces'
import { createMockServices, createInitialDatabase } from '../infrastructure/mock'
import { isTauriRuntime } from '../infrastructure/tauri/desktop-commands'
import { TauriTerminalService } from '../infrastructure/tauri/tauri-terminal-service'

export const createContainer = (): AppServices => {
  const services = createMockServices(createInitialDatabase())

  if (isTauriRuntime()) {
    services.terminal = new TauriTerminalService()
  }

  return services
}
