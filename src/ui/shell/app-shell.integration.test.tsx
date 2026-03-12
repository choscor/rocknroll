import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../test/render-with-providers'

describe('app shell integration', () => {
  it('renders the main layout with sidebar and chat', async () => {
    renderApp({ initialPath: '/chat' })

    expect(await screen.findByText('Workspaces')).toBeInTheDocument()
    expect(await screen.findByText("Let's build")).toBeInTheDocument()
  })

  it('navigates to settings and interacts with providers', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/settings' })

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(await screen.findByText('Provider Connections')).toBeInTheDocument()

    const oauthButtons = await screen.findAllByRole('button', {
      name: 'Connect OAuth',
    })
    await user.click(oauthButtons[0])
    expect(await screen.findByRole('status')).toHaveTextContent('connected via OAuth')
  })

  it('navigates to automations page', async () => {
    renderApp({ initialPath: '/automations' })

    expect(await screen.findByText('Automation Queue')).toBeInTheDocument()
  })

  it('navigates to skills page', async () => {
    renderApp({ initialPath: '/skills' })

    expect(await screen.findByRole('heading', { name: 'Skills' })).toBeInTheDocument()
  })

  it('shows workspace in sidebar', async () => {
    renderApp({ initialPath: '/chat' })

    expect(await screen.findByText('rocknroll')).toBeInTheDocument()
  })

  it('opens native folder chooser and adds workspace from selected path', async () => {
    const user = userEvent.setup()
    const promptSpy = vi
      .spyOn(window, 'prompt')
      .mockReturnValue('/workspace/new-app')
    renderApp({ initialPath: '/chat' })

    await user.click(await screen.findByRole('button', { name: 'Open workspace' }))
    promptSpy.mockRestore()

    expect((await screen.findAllByText('new-app')).length).toBeGreaterThan(0)
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Workspace new-app created',
    )
  })

  it('creates a new thread and sends a message', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/chat' })

    const newThreadButton = await screen.findByRole('button', {
      name: 'Create thread in rocknroll',
    })
    await user.click(newThreadButton)

    const titleInput = await screen.findByPlaceholderText('Thread title...')
    await user.type(titleInput, 'Test thread')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('status')).toHaveTextContent('Thread "Test thread" created')

    const messageInput = await screen.findByPlaceholderText('Type a message...')
    await user.type(messageInput, 'hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('You')).toBeInTheDocument()
    expect(await screen.findByText('Assistant')).toBeInTheDocument()
  })

  it('shows open and commit dropdown actions', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/chat' })

    await user.click(await screen.findByRole('button', { name: /^open$/i }))
    expect(await screen.findByText('VS Code')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: /commit/i }))
    expect(await screen.findByText('Git actions')).toBeInTheDocument()
    expect(await screen.findByText('Create PR')).toBeInTheDocument()
  })

  it('archives a thread from the thread row', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/chat' })

    await user.click(
      await screen.findByRole('button', { name: 'Create thread in rocknroll' }),
    )
    await user.type(await screen.findByPlaceholderText('Thread title...'), 'Archive me')
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('status')).toHaveTextContent('Thread "Archive me" created')
    await user.click(await screen.findByRole('button', { name: 'Archive Archive me' }))

    expect(screen.queryByRole('button', { name: 'Archive Archive me' })).not.toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent('Thread removed')
  })

  it('toggles workspace thread visibility', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/chat' })

    expect(await screen.findByText('Initial setup')).toBeInTheDocument()

    const workspaceToggle = await screen.findByRole('button', {
      name: /rocknroll.*main/i,
    })

    await user.click(workspaceToggle)
    expect(screen.queryByText('Initial setup')).not.toBeInTheDocument()

    await user.click(workspaceToggle)
    expect(await screen.findByText('Initial setup')).toBeInTheDocument()
  })

  it('toggles terminal and diff panels with data loading', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/chat' })

    await user.click(await screen.findByRole('button', { name: 'Toggle terminal' }))
    expect(
      await screen.findByText(/Native terminal requires Tauri runtime/),
    ).toBeInTheDocument()
    expect(screen.queryByText('Create terminal session')).not.toBeInTheDocument()
    expect(screen.queryByText('New session')).not.toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Toggle diff' }))
    expect(await screen.findByText('Branch')).toBeInTheDocument()
    expect((await screen.findAllByText('+4')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('-1')).length).toBeGreaterThan(0)
  })
})
