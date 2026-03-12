import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'
import { createMockServices, createInitialDatabase } from '../services/mock'
import { AppStoreProvider } from '../state/AppStoreContext'

interface RenderOptions {
  initialPath?: string
}

export const renderApp = ({ initialPath = '/connections' }: RenderOptions = {}) => {
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
