import type { TerminalService } from '../../repository/interfaces'
import { desktopCommands } from './desktop-commands'

export class TauriTerminalService implements TerminalService {
  listSessions() {
    return desktopCommands.listTerminalSessions()
  }

  createSession(
    worktreeId: string,
    options?: { cwd?: string; shell?: string },
  ) {
    return desktopCommands.createTerminalSession(
      worktreeId,
      options?.cwd,
      options?.shell,
    )
  }

  writeToSession(sessionId: string, input: string) {
    return desktopCommands.writeTerminalSession(sessionId, input)
  }

  resizeSession(sessionId: string, cols: number, rows: number) {
    return desktopCommands.resizeTerminalSession(sessionId, cols, rows)
  }

  closeSession(sessionId: string) {
    return desktopCommands.closeTerminalSession(sessionId)
  }
}
