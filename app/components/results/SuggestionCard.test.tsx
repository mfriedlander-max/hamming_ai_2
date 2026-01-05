import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SuggestionCard } from './SuggestionCard'
import type { Suggestion } from '@/types'

// Mock TestLinkage component
vi.mock('@/components/results/TestLinkage', () => ({
  TestLinkage: ({ testIds }: { testIds: string[] }) => (
    <div data-testid="test-linkage">Addresses {testIds.length} test(s)</div>
  ),
}))

describe('SuggestionCard', () => {
  const createMockSuggestion = (overrides: Partial<Suggestion> = {}): Suggestion => ({
    id: 'sug-1',
    analysisId: 'analysis-1',
    categoryId: 'category-1',
    type: 'add',
    targetSection: 'end of prompt',
    proposedText: 'New instruction to add',
    reason: 'This improves clarity and reduces ambiguity',
    linkedTestIds: ['test-1', 'test-2'],
    evidence: [{ testId: 'test-1', excerpt: 'Evidence excerpt' }],
    status: 'pending',
    ...overrides,
  })

  it('should render suggestion type badge', () => {
    const suggestion = createMockSuggestion({ type: 'add' })
    render(<SuggestionCard suggestion={suggestion} />)

    expect(screen.getByText('add')).toBeInTheDocument()
  })

  it('should render target section when provided', () => {
    const suggestion = createMockSuggestion({ targetSection: 'beginning' })
    render(<SuggestionCard suggestion={suggestion} />)

    expect(screen.getByText('→ beginning')).toBeInTheDocument()
  })

  it('should render reason text', () => {
    const suggestion = createMockSuggestion({ reason: 'Test reason' })
    render(<SuggestionCard suggestion={suggestion} />)

    expect(screen.getByText(/Test reason/)).toBeInTheDocument()
  })

  it('should render proposed text', () => {
    const suggestion = createMockSuggestion({ proposedText: 'Proposed change text' })
    render(<SuggestionCard suggestion={suggestion} />)

    expect(screen.getByText('Proposed change text')).toBeInTheDocument()
  })

  describe('suggestion types', () => {
    it('should render add type with green styling', () => {
      const suggestion = createMockSuggestion({ type: 'add' })
      render(<SuggestionCard suggestion={suggestion} />)

      const badge = screen.getByText('add')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('should render remove type with red styling', () => {
      const suggestion = createMockSuggestion({ type: 'remove' })
      render(<SuggestionCard suggestion={suggestion} />)

      const badge = screen.getByText('remove')
      expect(badge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('should render replace type with blue styling', () => {
      const suggestion = createMockSuggestion({ type: 'replace' })
      render(<SuggestionCard suggestion={suggestion} />)

      const badge = screen.getByText('replace')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
    })
  })

  describe('original text display', () => {
    it('should show original text for replace type', () => {
      const suggestion = createMockSuggestion({
        type: 'replace',
        originalText: 'Text being replaced',
      })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.getByText('Replaces:')).toBeInTheDocument()
      expect(screen.getByText('Text being replaced')).toBeInTheDocument()
    })

    it('should not show original text section when not provided', () => {
      const suggestion = createMockSuggestion({ type: 'add', originalText: undefined })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.queryByText('Replaces:')).not.toBeInTheDocument()
    })
  })

  describe('status indicators', () => {
    it('should not show status icon for pending', () => {
      const suggestion = createMockSuggestion({ status: 'pending' })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.queryByTestId('check-circle')).not.toBeInTheDocument()
      expect(screen.queryByTestId('x-circle')).not.toBeInTheDocument()
    })

    it('should show accept/reject buttons for pending status', () => {
      const suggestion = createMockSuggestion({ status: 'pending' })
      render(<SuggestionCard suggestion={suggestion} onAccept={() => {}} onReject={() => {}} />)

      expect(screen.getByText('Accept')).toBeInTheDocument()
      expect(screen.getByText('Reject')).toBeInTheDocument()
    })

    it('should not show accept/reject buttons for accepted status', () => {
      const suggestion = createMockSuggestion({ status: 'accepted' })
      render(<SuggestionCard suggestion={suggestion} onAccept={() => {}} onReject={() => {}} />)

      expect(screen.queryByText('Accept')).not.toBeInTheDocument()
      expect(screen.queryByText('Reject')).not.toBeInTheDocument()
    })

    it('should not show accept/reject buttons for rejected status', () => {
      const suggestion = createMockSuggestion({ status: 'rejected' })
      render(<SuggestionCard suggestion={suggestion} onAccept={() => {}} onReject={() => {}} />)

      expect(screen.queryByText('Accept')).not.toBeInTheDocument()
      expect(screen.queryByText('Reject')).not.toBeInTheDocument()
    })
  })

  describe('button handlers', () => {
    it('should call onAccept when Accept button clicked', () => {
      const onAccept = vi.fn()
      const suggestion = createMockSuggestion({ status: 'pending' })
      render(<SuggestionCard suggestion={suggestion} onAccept={onAccept} />)

      fireEvent.click(screen.getByText('Accept'))

      expect(onAccept).toHaveBeenCalledTimes(1)
    })

    it('should call onReject when Reject button clicked', () => {
      const onReject = vi.fn()
      const suggestion = createMockSuggestion({ status: 'pending' })
      render(<SuggestionCard suggestion={suggestion} onReject={onReject} />)

      fireEvent.click(screen.getByText('Reject'))

      expect(onReject).toHaveBeenCalledTimes(1)
    })
  })

  describe('evidence display', () => {
    it('should show evidence count in expandable section', () => {
      const suggestion = createMockSuggestion({
        evidence: [
          { testId: 'test-1', excerpt: 'excerpt 1' },
          { testId: 'test-2', excerpt: 'excerpt 2' },
        ],
      })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.getByText('View evidence (2)')).toBeInTheDocument()
    })

    it('should not show evidence section when empty', () => {
      const suggestion = createMockSuggestion({ evidence: [] })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.queryByText(/View evidence/)).not.toBeInTheDocument()
    })

    it('should expand evidence when clicked', () => {
      const suggestion = createMockSuggestion({
        evidence: [{ testId: 'test-1', excerpt: 'Visible excerpt' }],
      })
      render(<SuggestionCard suggestion={suggestion} />)

      fireEvent.click(screen.getByText('View evidence (1)'))

      expect(screen.getByText(/"Visible excerpt"/)).toBeInTheDocument()
    })
  })

  describe('diff patch display', () => {
    it('should show diff toggle button when patch exists', () => {
      const suggestion = createMockSuggestion({
        diffPatch: '--- a\n+++ b\n@@ -1 +1 @@\n-old\n+new',
      })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.getByText('Show Diff')).toBeInTheDocument()
    })

    it('should not show diff toggle when no patch', () => {
      const suggestion = createMockSuggestion({ diffPatch: undefined })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.queryByText('Show Diff')).not.toBeInTheDocument()
    })

    it('should toggle diff visibility when clicked', () => {
      const suggestion = createMockSuggestion({
        diffPatch: '--- original\n+++ modified',
      })
      render(<SuggestionCard suggestion={suggestion} />)

      // Initially hidden
      expect(screen.queryByText('--- original')).not.toBeInTheDocument()

      // Click to show
      fireEvent.click(screen.getByText('Show Diff'))
      expect(screen.getByText(/--- original/)).toBeInTheDocument()
      expect(screen.getByText('Hide Diff')).toBeInTheDocument()

      // Click to hide
      fireEvent.click(screen.getByText('Hide Diff'))
      expect(screen.queryByText(/--- original/)).not.toBeInTheDocument()
    })
  })

  describe('test linkage', () => {
    it('should render TestLinkage component with linked test ids', () => {
      const suggestion = createMockSuggestion({ linkedTestIds: ['test-1', 'test-2', 'test-3'] })
      render(<SuggestionCard suggestion={suggestion} />)

      expect(screen.getByTestId('test-linkage')).toBeInTheDocument()
      expect(screen.getByText('Addresses 3 test(s)')).toBeInTheDocument()
    })
  })
})
