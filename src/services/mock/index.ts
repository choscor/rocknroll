import type { AppServices } from '../interfaces'
import { MockAuthService } from './mockAuthService'
import { createInitialDatabase, type MockDatabase } from './mockDatabase'
import { MockGitService } from './mockGitService'
import { MockTerminalService } from './mockTerminalService'
import { MockWorktreeService } from './mockWorktreeService'

export const createMockServices = (
  database: MockDatabase = createInitialDatabase(),
): AppServices => ({
  auth: new MockAuthService(database),
  worktree: new MockWorktreeService(database),
  git: new MockGitService(database),
  terminal: new MockTerminalService(database),
})

export { createInitialDatabase } from './mockDatabase'
