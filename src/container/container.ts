import type { AppServices } from '../repository/interfaces'
import { createMockServices, createInitialDatabase } from '../infrastructure/mock'

export const createContainer = (): AppServices => {
  return createMockServices(createInitialDatabase())
}
