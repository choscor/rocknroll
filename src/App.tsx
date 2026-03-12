import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { AutomationPage } from './features/automation/AutomationPage'
import { ConnectionsPage } from './features/connections/ConnectionsPage'
import { GitPage } from './features/git/GitPage'
import { TerminalPage } from './features/terminal/TerminalPage'
import { WorkspacePage } from './features/workspace/WorkspacePage'
import { AppStoreProvider } from './state/AppStoreContext'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/connections" />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/git" element={<GitPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
        <Route path="/automation" element={<AutomationPage />} />
      </Route>
    </Routes>
  )
}

const App = () => {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppStoreProvider>
  )
}

export default App
