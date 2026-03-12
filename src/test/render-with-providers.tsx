import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../app'
import { createMockServices, createInitialDatabase } from '../infrastructure/mock'
import { AppStoreProvider } from '../state/app-store-context'

interface RenderOptions {
  initialPath?: string
}

export const renderApp = ({ initialPath = '/chat' }: RenderOptions = {}) => {
  const services = createMockServices(createInitialDatabase())

  return render(
    <AppStoreProvider services={services}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppRoutes />
      </MemoryRouter>
    </AppStoreProvider>,
  )
}

export const renderWithProviders = (children: ReactNode) => {
  const services = createMockServices(createInitialDatabase())

  return render(
    <AppStoreProvider services={services}>
      <MemoryRouter>{children}</MemoryRouter>
    </AppStoreProvider>,
  )
}
