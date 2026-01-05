import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FailureCategoryCard } from './FailureCategoryCard'
import type { FailureCategory } from '@/types'

describe('FailureCategoryCard', () => {
  const createMockCategory = (overrides: Partial<FailureCategory> = {}): FailureCategory => ({
    id: 'cat-1',
    name: 'Test Category',
    description: 'This is a test category description',
    severity: 'medium',
    affectedTestIds: ['test-1', 'test-2'],
    evidence: [
      { testId: 'test-1', excerpt: 'Evidence 1' },
      { testId: 'test-2', excerpt: 'Evidence 2' },
    ],
    count: 2,
    ...overrides,
  })

  it('should render category name and description', () => {
    const category = createMockCategory()
    render(<FailureCategoryCard category={category} />)

    expect(screen.getByText('Test Category')).toBeInTheDocument()
    expect(screen.getByText('This is a test category description')).toBeInTheDocument()
  })

  it('should display affected test count', () => {
    const category = createMockCategory({ count: 5 })
    render(<FailureCategoryCard category={category} />)

    expect(screen.getByText('5 affected tests')).toBeInTheDocument()
  })

  it('should display evidence snippet count', () => {
    const category = createMockCategory()
    render(<FailureCategoryCard category={category} />)

    expect(screen.getByText('2 evidence snippets')).toBeInTheDocument()
  })

  describe('severity levels', () => {
    it('should render high severity badge', () => {
      const category = createMockCategory({ severity: 'high' })
      render(<FailureCategoryCard category={category} />)

      const badge = screen.getByText('high')
      expect(badge).toBeInTheDocument()
    })

    it('should render medium severity badge', () => {
      const category = createMockCategory({ severity: 'medium' })
      render(<FailureCategoryCard category={category} />)

      const badge = screen.getByText('medium')
      expect(badge).toBeInTheDocument()
    })

    it('should render low severity badge', () => {
      const category = createMockCategory({ severity: 'low' })
      render(<FailureCategoryCard category={category} />)

      const badge = screen.getByText('low')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('click handler', () => {
    it('should call onViewEvidence when clicked', () => {
      const category = createMockCategory()
      const onViewEvidence = vi.fn()

      render(<FailureCategoryCard category={category} onViewEvidence={onViewEvidence} />)

      const card = screen.getByText('Test Category').closest('[class*="cursor-pointer"]')
      if (card) {
        fireEvent.click(card)
      }

      expect(onViewEvidence).toHaveBeenCalledTimes(1)
    })

    it('should not throw when onViewEvidence is not provided', () => {
      const category = createMockCategory()

      render(<FailureCategoryCard category={category} />)

      const card = screen.getByText('Test Category').closest('[class*="cursor-pointer"]')
      expect(() => {
        if (card) fireEvent.click(card)
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle zero affected tests', () => {
      const category = createMockCategory({ count: 0, affectedTestIds: [] })
      render(<FailureCategoryCard category={category} />)

      expect(screen.getByText('0 affected tests')).toBeInTheDocument()
    })

    it('should handle empty evidence array', () => {
      const category = createMockCategory({ evidence: [] })
      render(<FailureCategoryCard category={category} />)

      expect(screen.getByText('0 evidence snippets')).toBeInTheDocument()
    })

    it('should handle long description text', () => {
      const longDescription = 'A'.repeat(500)
      const category = createMockCategory({ description: longDescription })
      render(<FailureCategoryCard category={category} />)

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })
})
