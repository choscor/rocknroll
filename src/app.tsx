import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './ui/shell/app-shell'
import { SettingsPage } from './ui/settings/settings-page'
import { ChatView } from './ui/chat/chat-view'
import { AppStoreProvider } from './state/app-store-context'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/chat" />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/workspace/:workspaceId" element={<ChatView />} />
        <Route path="/workspace/:workspaceId/thread/:threadId" element={<ChatView />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Backward compatibility redirects */}
        <Route path="/connections" element={<Navigate replace to="/settings" />} />
        <Route path="/workspace" element={<Navigate replace to="/chat" />} />
        <Route path="/git" element={<Navigate replace to="/chat" />} />
        <Route path="/terminal" element={<Navigate replace to="/chat" />} />
        <Route path="/automation" element={<Navigate replace to="/chat" />} />
        <Route path="/automations" element={<Navigate replace to="/chat" />} />
        <Route path="/skills" element={<Navigate replace to="/chat" />} />
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
