import type { AppServices } from '../../repository/interfaces'
import { MockAuthService } from './mock-auth-service'
import { MockChatService } from './mock-chat-service'
import { createInitialDatabase, type MockDatabase } from './mock-database'
import { MockGitService } from './mock-git-service'
import { MockSkillService } from './mock-skill-service'
import { MockTerminalService } from './mock-terminal-service'
import { MockThreadService } from './mock-thread-service'
import { MockWorkspaceService } from './mock-workspace-service'
import { MockWorktreeService } from './mock-worktree-service'

export const createMockServices = (
  database: MockDatabase = createInitialDatabase(),
): AppServices => ({
  auth: new MockAuthService(database),
  worktree: new MockWorktreeService(database),
  git: new MockGitService(database),
  terminal: new MockTerminalService(database),
  chat: new MockChatService(database),
  workspace: new MockWorkspaceService(database),
  thread: new MockThreadService(database),
  skill: new MockSkillService(database),
})

export { createInitialDatabase } from './mock-database'
