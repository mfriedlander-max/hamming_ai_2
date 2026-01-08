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

  describe('invalid test handling', () => {
    it('should show warning banner when tests are invalid', () => {
      const evidence = [createMockEvidence({ testId: 'invalid-test' })]
      const invalidTest = createMockTest({
        id: 'invalid-test',
        transcript: undefined as unknown as string,
      })

      render(<EvidenceViewer evidence={evidence} tests={[invalidTest]} />)

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('1 test(s) are invalid and were skipped.')).toBeInTheDocument()
    })

    it('should not show warning banner when all tests are valid', () => {
      const evidence = [createMockEvidence()]
      const tests = [createMockTest()]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should gray out invalid test cards with opacity-50', () => {
      const evidence = [createMockEvidence({ testId: 'invalid-test' })]
      const invalidTest = createMockTest({
        id: 'invalid-test',
        transcript: undefined as unknown as string,
      })

      render(<EvidenceViewer evidence={evidence} tests={[invalidTest]} />)

      // The card should have the opacity-50 class
      const cards = document.querySelectorAll('.opacity-50')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should show warning icon for invalid tests', () => {
      const evidence = [createMockEvidence({ testId: 'invalid-test' })]
      const invalidTest = createMockTest({
        id: 'invalid-test',
        transcript: undefined as unknown as string,
      })

      render(<EvidenceViewer evidence={evidence} tests={[invalidTest]} />)

      // Check for aria-label indicating invalid test
      expect(screen.getByLabelText(/Invalid test: Missing transcript/)).toBeInTheDocument()
    })

    it('should not show transcript for invalid tests', () => {
      const evidence = [createMockEvidence({ testId: 'invalid-test' })]
      const invalidTest = createMockTest({
        id: 'invalid-test',
        transcript: undefined as unknown as string,
      })

      render(<EvidenceViewer evidence={evidence} tests={[invalidTest]} />)

      expect(screen.queryByText('View full transcript')).not.toBeInTheDocument()
    })

    it('should show transcript for valid tests while hiding it for invalid ones', () => {
      const evidence = [
        createMockEvidence({ testId: 'valid-test', excerpt: 'Valid excerpt' }),
        createMockEvidence({ testId: 'invalid-test', excerpt: 'Invalid excerpt' }),
      ]
      const tests = [
        createMockTest({ id: 'valid-test', transcript: 'Valid transcript' }),
        createMockTest({ id: 'invalid-test', transcript: undefined as unknown as string }),
      ]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      // Should only have one "View full transcript" for the valid test
      const transcriptLinks = screen.getAllByText('View full transcript')
      expect(transcriptLinks).toHaveLength(1)
    })

    it('should count correct number of invalid tests in summary', () => {
      const evidence = [
        createMockEvidence({ testId: 'invalid-1', excerpt: 'Excerpt 1' }),
        createMockEvidence({ testId: 'invalid-2', excerpt: 'Excerpt 2' }),
        createMockEvidence({ testId: 'valid-1', excerpt: 'Excerpt 3' }),
      ]
      const tests = [
        createMockTest({ id: 'invalid-1', transcript: undefined as unknown as string }),
        createMockTest({ id: 'invalid-2', transcript: null as unknown as string }),
        createMockTest({ id: 'valid-1', transcript: 'Valid transcript' }),
      ]

      render(<EvidenceViewer evidence={evidence} tests={tests} />)

      expect(screen.getByText('2 test(s) are invalid and were skipped.')).toBeInTheDocument()
    })
  })
})
