import { describe, it, expect, vi } from 'vitest'
import { applyAcceptedSuggestions } from './applier'
import type { Suggestion } from '@/types'

describe('applyAcceptedSuggestions', () => {
  const createMockSuggestion = (overrides: Partial<Suggestion> = {}): Suggestion => ({
    id: 'sug-1',
    analysisId: 'analysis-1',
    categoryId: 'category-1',
    type: 'add',
    proposedText: 'New instruction',
    reason: 'Improves clarity',
    linkedTestIds: ['test-1'],
    evidence: [],
    status: 'pending',
    ...overrides,
  })

  describe('no accepted suggestions', () => {
    it('should return original prompt when no suggestions', () => {
      const result = applyAcceptedSuggestions('Original prompt', [])

      expect(result.success).toBe(false)
      expect(result.updatedPrompt).toBe('Original prompt')
      expect(result.appliedSuggestions).toEqual([])
    })

    it('should return original prompt when all suggestions are pending', () => {
      const suggestions = [
        createMockSuggestion({ id: 'sug-1', status: 'pending' }),
        createMockSuggestion({ id: 'sug-2', status: 'pending' }),
      ]

      const result = applyAcceptedSuggestions('Original prompt', suggestions)

      expect(result.success).toBe(false)
      expect(result.updatedPrompt).toBe('Original prompt')
    })

    it('should return original prompt when all suggestions are rejected', () => {
      const suggestions = [
        createMockSuggestion({ id: 'sug-1', status: 'rejected' }),
      ]

      const result = applyAcceptedSuggestions('Original prompt', suggestions)

      expect(result.success).toBe(false)
    })
  })

  describe('add suggestions', () => {
    it('should append text for add type', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'add',
          proposedText: 'Additional instruction.',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Be helpful.', suggestions)

      expect(result.success).toBe(true)
      expect(result.updatedPrompt).toBe('Be helpful.\n\nAdditional instruction.')
      expect(result.appliedSuggestions).toContain('sug-1')
    })

    it('should apply multiple add suggestions', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'add',
          proposedText: 'First addition.',
          status: 'accepted',
        }),
        createMockSuggestion({
          id: 'sug-2',
          type: 'add',
          proposedText: 'Second addition.',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Base.', suggestions)

      expect(result.success).toBe(true)
      expect(result.updatedPrompt).toContain('First addition.')
      expect(result.updatedPrompt).toContain('Second addition.')
      expect(result.appliedSuggestions).toHaveLength(2)
    })
  })

  describe('replace suggestions', () => {
    it('should replace text correctly', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'replace',
          originalText: 'helpful',
          proposedText: 'friendly',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Be helpful and kind.', suggestions)

      expect(result.success).toBe(true)
      expect(result.updatedPrompt).toBe('Be friendly and kind.')
    })

    it('should handle text not found gracefully', () => {
      // The applySingleSuggestion will throw, but it's caught
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'replace',
          originalText: 'nonexistent text',
          proposedText: 'replacement',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Original prompt.', suggestions)

      expect(result.success).toBe(true) // It succeeds but doesn't apply the suggestion
      expect(result.appliedSuggestions).not.toContain('sug-1')

      consoleSpy.mockRestore()
    })
  })

  describe('remove suggestions', () => {
    it('should remove text correctly', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'remove',
          originalText: ' and kind',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Be helpful and kind.', suggestions)

      expect(result.success).toBe(true)
      expect(result.updatedPrompt).toBe('Be helpful.')
    })
  })

  describe('conflict detection', () => {
    it('should detect conflicts when multiple suggestions modify same text', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'replace',
          originalText: 'shared text',
          proposedText: 'replacement 1',
          status: 'accepted',
        }),
        createMockSuggestion({
          id: 'sug-2',
          type: 'replace',
          originalText: 'shared text',
          proposedText: 'replacement 2',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('This has shared text here.', suggestions)

      expect(result.success).toBe(false)
      expect(result.conflicts).toBeDefined()
      expect(result.conflicts?.length).toBe(2)
      expect(result.conflicts?.some((c) => c.suggestionId === 'sug-1')).toBe(true)
      expect(result.conflicts?.some((c) => c.suggestionId === 'sug-2')).toBe(true)
    })

    it('should not detect conflicts for different original texts', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'replace',
          originalText: 'first text',
          proposedText: 'replacement 1',
          status: 'accepted',
        }),
        createMockSuggestion({
          id: 'sug-2',
          type: 'replace',
          originalText: 'second text',
          proposedText: 'replacement 2',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions(
        'Has first text and second text.',
        suggestions
      )

      expect(result.success).toBe(true)
      expect(result.conflicts).toBeUndefined()
    })

    it('should not detect conflicts for add suggestions', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'add',
          proposedText: 'Addition 1',
          status: 'accepted',
        }),
        createMockSuggestion({
          id: 'sug-2',
          type: 'add',
          proposedText: 'Addition 2',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Base prompt.', suggestions)

      expect(result.success).toBe(true)
      expect(result.conflicts).toBeUndefined()
    })
  })

  describe('mixed suggestion statuses', () => {
    it('should only apply accepted suggestions', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'add',
          proposedText: 'Accepted addition.',
          status: 'accepted',
        }),
        createMockSuggestion({
          id: 'sug-2',
          type: 'add',
          proposedText: 'Rejected addition.',
          status: 'rejected',
        }),
        createMockSuggestion({
          id: 'sug-3',
          type: 'add',
          proposedText: 'Pending addition.',
          status: 'pending',
        }),
      ]

      const result = applyAcceptedSuggestions('Base.', suggestions)

      expect(result.success).toBe(true)
      expect(result.updatedPrompt).toContain('Accepted addition.')
      expect(result.updatedPrompt).not.toContain('Rejected addition.')
      expect(result.updatedPrompt).not.toContain('Pending addition.')
      expect(result.appliedSuggestions).toEqual(['sug-1'])
    })
  })

  describe('edge cases', () => {
    it('should handle empty original prompt', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'add',
          proposedText: 'New content.',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('', suggestions)

      expect(result.success).toBe(true)
      expect(result.updatedPrompt).toContain('New content.')
    })

    it('should trim whitespace when adding', () => {
      const suggestions = [
        createMockSuggestion({
          id: 'sug-1',
          type: 'add',
          proposedText: 'Addition.',
          status: 'accepted',
        }),
      ]

      const result = applyAcceptedSuggestions('Base text  \n  ', suggestions)

      expect(result.updatedPrompt).toBe('Base text\n\nAddition.')
    })
  })
})
