import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiffViewer } from './DiffViewer'

describe('DiffViewer', () => {
  it('should render Original and Modified headers', () => {
    render(<DiffViewer original="text" modified="text" />)

    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(screen.getByText('Modified')).toBeInTheDocument()
  })

  describe('identical text', () => {
    it('should show unchanged lines on both sides', () => {
      render(<DiffViewer original="Same line" modified="Same line" />)

      const allTexts = screen.getAllByText('Same line')
      expect(allTexts.length).toBe(2) // One on each side
    })

    it('should show line numbers for unchanged content', () => {
      render(<DiffViewer original="Line one" modified="Line one" />)

      const lineNumbers = screen.getAllByText('1')
      expect(lineNumbers.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('added lines', () => {
    it('should show added content on modified side', () => {
      // Using completely different content to trigger clear add/remove
      render(<DiffViewer original="Original only" modified="Modified only" />)

      expect(screen.getByText('Original only')).toBeInTheDocument()
      expect(screen.getByText('Modified only')).toBeInTheDocument()
    })

    it('should render added line with green styling', () => {
      render(<DiffViewer original="Old" modified="New" />)

      const newElement = screen.getByText('New').closest('div')
      expect(newElement).toHaveClass('bg-green-100')
    })
  })

  describe('removed lines', () => {
    it('should render removed line with red styling', () => {
      render(<DiffViewer original="Old" modified="New" />)

      const oldElement = screen.getByText('Old').closest('div')
      expect(oldElement).toHaveClass('bg-red-100')
    })
  })

  describe('multiline content', () => {
    it('should handle multiple lines correctly', () => {
      const original = 'Line A\nLine B\nLine C'
      const modified = 'Line A\nLine B\nLine C'

      render(<DiffViewer original={original} modified={modified} />)

      expect(screen.getAllByText('Line A').length).toBe(2)
      expect(screen.getAllByText('Line B').length).toBe(2)
      expect(screen.getAllByText('Line C').length).toBe(2)
    })

    it('should show correct line numbers for multiline', () => {
      const original = 'One\nTwo\nThree'
      const modified = 'One\nTwo\nThree'

      render(<DiffViewer original={original} modified={modified} />)

      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('complex diffs', () => {
    it('should handle mixed additions, removals, and unchanged', () => {
      const original = 'Keep this\nRemove this\nKeep this too'
      const modified = 'Keep this\nAdd this\nKeep this too'

      render(<DiffViewer original={original} modified={modified} />)

      // Original side should have removed line
      expect(screen.getByText('Remove this')).toBeInTheDocument()

      // Modified side should have added line
      expect(screen.getByText('Add this')).toBeInTheDocument()

      // Both sides should have unchanged lines
      expect(screen.getAllByText('Keep this').length).toBe(2)
      expect(screen.getAllByText('Keep this too').length).toBe(2)
    })
  })

  describe('empty content', () => {
    it('should handle empty original', () => {
      render(<DiffViewer original="" modified="New content" />)

      expect(screen.getByText('New content')).toBeInTheDocument()
    })

    it('should handle empty modified', () => {
      render(<DiffViewer original="Old content" modified="" />)

      expect(screen.getByText('Old content')).toBeInTheDocument()
    })

    it('should handle both empty', () => {
      render(<DiffViewer original="" modified="" />)

      expect(screen.getByText('Original')).toBeInTheDocument()
      expect(screen.getByText('Modified')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should apply removed styling on original side', () => {
      render(<DiffViewer original="Removed" modified="Added" />)

      const removedElement = screen.getByText('Removed').closest('div')
      expect(removedElement).toHaveClass('bg-red-100', 'text-red-900')
    })

    it('should apply added styling on modified side', () => {
      render(<DiffViewer original="Removed" modified="Added" />)

      const addedElement = screen.getByText('Added').closest('div')
      expect(addedElement).toHaveClass('bg-green-100', 'text-green-900')
    })

    it('should apply unchanged styling', () => {
      render(<DiffViewer original="Same" modified="Same" />)

      const unchangedElements = screen.getAllByText('Same')
      unchangedElements.forEach((el) => {
        expect(el.closest('div')).toHaveClass('text-gray-600')
      })
    })
  })
})
