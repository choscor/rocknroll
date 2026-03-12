import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/renderWithProviders'

describe('app shell integration', () => {
  it('navigates between pages and runs primary flows', async () => {
    const user = userEvent.setup()
    renderApp({ initialPath: '/connections' })

    expect(await screen.findByText('Provider Connections')).toBeInTheDocument()

    const oauthButtons = await screen.findAllByRole('button', {
      name: 'Connect OAuth',
    })
    await user.click(oauthButtons[0])
    expect(await screen.findByRole('status')).toHaveTextContent('connected via OAuth')

    await user.click(screen.getByRole('link', { name: 'Workspace' }))
    expect(await screen.findByText('Workspace + Worktrees')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('feature-auth'), 'feature-terminal')
    await user.type(screen.getByPlaceholderText('feat/auth-flow'), 'feat/terminal-flow')
    await user.type(
      screen.getByPlaceholderText('/workspace/feature-auth'),
      '/workspace/feature-terminal',
    )

    await user.click(screen.getByRole('button', { name: 'Create + Activate' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Worktree feature-terminal created.',
    )

    await user.click(screen.getByRole('link', { name: 'Git + PR' }))
    expect(await screen.findByText('Git Diff + AI Commit + PR')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Refresh Diff' }))
    expect(await screen.findByText(/diff --git/)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Generate AI Commit Message' }),
    )
    expect(await screen.findByDisplayValue(/feat\(/)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Terminal' }))
    expect(await screen.findByText('Terminal Sessions')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New Session' }))
    expect(
      await screen.findByRole('button', { name: /term-1 \(open\)/ }),
    ).toBeInTheDocument()
  })
})
