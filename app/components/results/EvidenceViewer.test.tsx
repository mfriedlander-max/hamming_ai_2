import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvidenceViewer } from './EvidenceViewer'
import type { EvidenceSnippet, TestResult } from '@/types'

describe('EvidenceViewer', () => {
  const createMockEvidence = (overrides: Partial<EvidenceSnippet> = {}): EvidenceSnippet => ({
    testId: 'test-1',
    excerpt: 'This is the excerpt from the test',
    context: 'This provides context about why this is problematic',
    ...overrides,
  })

  const createMockTest = (overrides: Partial<TestResult> = {}): TestResult => ({
    id: 'test-1',
    testBatchId: 'batch-1',
    inputData: { query: 'test query' },
    expectedBehavior: 'Expected behavior',
    actualBehavior: 'Actual behavior',
    transcript: 'Full transcript of the test conversation goes here',
    status: 'fail',
    metadata: {},
    ...overrides,
  })

  it('should render the Evidence heading', () => {
    render(<EvidenceViewer evidence={[]} tests={[]} />)

    expect(screen.getByText('Evidence')).toBeInTheDocument()
  })

  it('should render evidence snippets', () => {
    const evidence = [createMockEvidence()]
    const tests = [createMockTest()]

    render(<EvidenceViewer evidence={evidence} tests={tests} />)

    expect(screen.getByText('Test ID: test-1')).toBeInTheDocument()
    expect(screen.getByText('This is the excerpt from the test')).toBeInTheDocument()
  })

  it('should render context when provided', () => {
    const evidence = [createMockEvidence({ context: 'Important context here' })]
    const tests = [createMockTest()]

    render(<EvidenceViewer evidence={evidence} tests={tests} />)

    expect(screen.getByText(/Important context here/)).toBeInTheDocument()
  })

  it('should not render context when not provided', () => {
    const evidence = [createMockEvidence({ context: undefined })]
    const tests = [createMockTest()]

    render(<EvidenceViewer evidence={evidence} tests={tests} />)

    expect(screen.queryByText('Context:')).not.toBeInTheDocument()
  })

  it('should render multiple evidence snippets', () => {
    const evidence = [
      createMockEvidence({ testId: 'test-1', excerpt: 'First excerpt' }),
      createMockEvidence({ testId: 'test-2', excerpt: 'Second excerpt' }),
      createMockEvidence({ testId: 'test-3', excerpt: 'Third excerpt' }),
    ]
    const tests = [
      createMockTest({ id: 'test-1' }),
      createMockTest({ id: 'test-2' }),
      createMockTest({ id: 'test-3' }),
    ]

    render(<EvidenceViewer evidence={evidence} tests={tests} />)

    expect(screen.getByText('Test ID: test-1')).toBeInTheDocument()
    expect(screen.getByText('Test ID: test-2')).toBeInTheDocument()
    expect(screen.getByText('Test ID: test-3')).toBeInTheDocument()
    expect(screen.getByText('First excerpt')).toBeInTheDocument()
    expect(screen.getByText('Second excerpt')).toBeInTheDocument()
    expect(screen.getByText('Third excerpt')).toBeInTheDocument()
  })

  describe('expandable transcript', () => {
    it('should show "View full transcript" when test exists', () => {
      const evidence = [createMockEvidence()]
      const tests = [createMockTest()]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      expect(screen.getByText('View full transcript')).toBeInTheDocument()
    })

    it('should not show "View full transcript" when test not found', () => {
      const evidence = [createMockEvidence({ testId: 'nonexistent-test' })]
      const tests = [createMockTest({ id: 'different-test' })]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      expect(screen.queryByText('View full transcript')).not.toBeInTheDocument()
    })

    it('should expand to show transcript when clicked', () => {
      const evidence = [createMockEvidence()]
      const tests = [createMockTest({ transcript: 'This is the full transcript content' })]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      const summary = screen.getByText('View full transcript')
      fireEvent.click(summary)

      expect(screen.getByText('This is the full transcript content')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty evidence array', () => {
      render(<EvidenceViewer evidence={[]} tests={[]} />)

      expect(screen.getByText('Evidence')).toBeInTheDocument()
      expect(screen.queryByText('Test ID:')).not.toBeInTheDocument()
    })

    it('should handle evidence with missing test', () => {
      const evidence = [createMockEvidence({ testId: 'missing-test' })]
      const tests: TestResult[] = []

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      expect(screen.getByText('Test ID: missing-test')).toBeInTheDocument()
      expect(screen.queryByText('View full transcript')).not.toBeInTheDocument()
    })

    it('should preserve whitespace in excerpts', () => {
      const evidence = [
        createMockEvidence({
          excerpt: 'Line 1\nLine 2\nLine 3',
        }),
      ]
      const tests = [createMockTest()]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      const excerptElement = screen.getByText(/Line 1/)
      expect(excerptElement).toHaveClass('whitespace-pre-wrap')
    })
  })
})
