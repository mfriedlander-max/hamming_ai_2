import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock functions
const mockSuggestionsAdd = vi.fn()
const mockSuggestionsGet = vi.fn()
const mockSuggestionsUpdate = vi.fn()
const mockSuggestionsToArray = vi.fn()
const mockAnalysesGet = vi.fn()
const mockTransaction = vi.fn()
const mockCreateAuditEntry = vi.fn().mockResolvedValue(undefined)
const mockGenerateDiff = vi.fn().mockReturnValue({
  patch: '--- original\n+++ modified',
  additions: 1,
  deletions: 0,
})

// Mock modules before importing
vi.mock('./client', () => ({
  db: {
    suggestions: {
      add: (data: any) => mockSuggestionsAdd(data),
      get: (id: string) => mockSuggestionsGet(id),
      update: (id: string, data: any) => mockSuggestionsUpdate(id, data),
      where: () => ({
        equals: () => ({
          toArray: () => mockSuggestionsToArray(),
        }),
      }),
    },
    analyses: {
      get: (id: string) => mockAnalysesGet(id),
    },
    transaction: (_mode: string, _table: any, callback: () => Promise<void>) => mockTransaction(callback),
  },
}))

vi.mock('./auditLog', () => ({
  createAuditEntry: (data: any) => mockCreateAuditEntry(data),
}))

vi.mock('@/lib/diff/generator', () => ({
  generateDiff: (a: string, b: string) => mockGenerateDiff(a, b),
}))

vi.mock('nanoid', () => ({
  nanoid: () => 'mock-suggestion-id',
}))

// Import after mocks
import {
  createSuggestion,
  getSuggestion,
  getSuggestionsByAnalysis,
  getSuggestionsByCategory,
  updateSuggestionStatus,
  restoreSuggestionStatesForVersion,
} from './suggestions'

describe('suggestions database operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSuggestionsAdd.mockResolvedValue('mock-suggestion-id')
    mockSuggestionsGet.mockResolvedValue(undefined)
    mockSuggestionsUpdate.mockResolvedValue(1)
    mockSuggestionsToArray.mockResolvedValue([])
    mockAnalysesGet.mockResolvedValue(undefined)
    // Mock transaction to execute the callback immediately
    mockTransaction.mockImplementation(async (callback: () => Promise<void>) => {
      await callback()
    })
  })

  describe('createSuggestion', () => {
    const mockSuggestionData = {
      analysisId: 'analysis-1',
      categoryId: 'category-1',
      type: 'add' as const,
      targetSection: 'end',
      proposedText: 'New instruction text',
      reason: 'Improves clarity',
      linkedTestIds: ['test-1', 'test-2'],
      evidence: [{ testId: 'test-1', excerpt: 'excerpt' }],
      originalPrompt: 'Original prompt text',
    }

    it('should create a suggestion with correct structure', async () => {
      const result = await createSuggestion(mockSuggestionData)

      expect(result).toMatchObject({
        id: 'mock-suggestion-id',
        analysisId: 'analysis-1',
        categoryId: 'category-1',
        type: 'add',
        targetSection: 'end',
        proposedText: 'New instruction text',
        reason: 'Improves clarity',
        linkedTestIds: ['test-1', 'test-2'],
        status: 'pending',
      })
    })

    it('should generate diff patch for the suggestion', async () => {
      await createSuggestion(mockSuggestionData)

      expect(mockGenerateDiff).toHaveBeenCalled()
    })

    it('should handle replace type with originalText', async () => {
      const result = await createSuggestion({
        ...mockSuggestionData,
        type: 'replace',
        originalText: 'old text',
        proposedText: 'new text',
      })

      expect(result.type).toBe('replace')
      expect(result.originalText).toBe('old text')
    })

    it('should add suggestion to database', async () => {
      await createSuggestion(mockSuggestionData)

      expect(mockSuggestionsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-suggestion-id',
          status: 'pending',
        })
      )
    })
  })

  describe('getSuggestion', () => {
    it('should return suggestion when found', async () => {
      const mockSuggestion = {
        id: 'suggestion-1',
        analysisId: 'analysis-1',
        status: 'pending',
      }
      mockSuggestionsGet.mockResolvedValue(mockSuggestion)

      const result = await getSuggestion('suggestion-1')

      expect(result).toEqual(mockSuggestion)
      expect(mockSuggestionsGet).toHaveBeenCalledWith('suggestion-1')
    })

    it('should return undefined when not found', async () => {
      mockSuggestionsGet.mockResolvedValue(undefined)

      const result = await getSuggestion('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getSuggestionsByAnalysis', () => {
    it('should return suggestions for an analysis', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1' },
        { id: 'sug-2', analysisId: 'analysis-1' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      const result = await getSuggestionsByAnalysis('analysis-1')

      expect(result).toEqual(mockSuggestions)
    })

    it('should return empty array when no suggestions exist', async () => {
      mockSuggestionsToArray.mockResolvedValue([])

      const result = await getSuggestionsByAnalysis('analysis-1')

      expect(result).toEqual([])
    })
  })

  describe('getSuggestionsByCategory', () => {
    it('should return suggestions for a category', async () => {
      const mockSuggestions = [{ id: 'sug-1', categoryId: 'cat-1' }]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      const result = await getSuggestionsByCategory('cat-1')

      expect(result).toEqual(mockSuggestions)
    })
  })

  describe('updateSuggestionStatus', () => {
    it('should update suggestion status to accepted', async () => {
      mockSuggestionsGet.mockResolvedValue({
        id: 'sug-1',
        analysisId: 'analysis-1',
        categoryId: 'cat-1',
      })
      mockAnalysesGet.mockResolvedValue({
        id: 'analysis-1',
        projectId: 'project-1',
      })

      await updateSuggestionStatus('sug-1', 'accepted')

      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-1', {
        status: 'accepted',
        reviewedAt: expect.any(Number),
        reviewNotes: undefined,
      })
    })

    it('should update suggestion status to rejected', async () => {
      mockSuggestionsGet.mockResolvedValue({
        id: 'sug-1',
        analysisId: 'analysis-1',
        categoryId: 'cat-1',
      })
      mockAnalysesGet.mockResolvedValue({
        id: 'analysis-1',
        projectId: 'project-1',
      })

      await updateSuggestionStatus('sug-1', 'rejected', 'Not applicable')

      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-1', {
        status: 'rejected',
        reviewedAt: expect.any(Number),
        reviewNotes: 'Not applicable',
      })
    })

    it('should create audit entry when accepting', async () => {
      mockSuggestionsGet.mockResolvedValue({
        id: 'sug-1',
        analysisId: 'analysis-1',
        categoryId: 'cat-1',
      })
      mockAnalysesGet.mockResolvedValue({
        id: 'analysis-1',
        projectId: 'project-1',
      })

      await updateSuggestionStatus('sug-1', 'accepted')

      expect(mockCreateAuditEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'accepted_suggestion',
          actor: 'user',
        })
      )
    })

    it('should create audit entry when rejecting', async () => {
      mockSuggestionsGet.mockResolvedValue({
        id: 'sug-1',
        analysisId: 'analysis-1',
        categoryId: 'cat-1',
      })
      mockAnalysesGet.mockResolvedValue({
        id: 'analysis-1',
        projectId: 'project-1',
      })

      await updateSuggestionStatus('sug-1', 'rejected')

      expect(mockCreateAuditEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'rejected_suggestion',
        })
      )
    })

    it('should not create audit entry when status is pending', async () => {
      await updateSuggestionStatus('sug-1', 'pending')

      expect(mockCreateAuditEntry).not.toHaveBeenCalled()
    })
  })

  describe('restoreSuggestionStatesForVersion', () => {
    it('should set accepted suggestions to applied status', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1', status: 'pending' },
        { id: 'sug-2', analysisId: 'analysis-1', status: 'pending' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      await restoreSuggestionStatesForVersion('analysis-1', ['sug-1'], [])

      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-1', {
        status: 'applied',
        reviewedAt: expect.any(Number),
      })
    })

    it('should set rejected suggestions to rejected_applied status', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1', status: 'pending' },
        { id: 'sug-2', analysisId: 'analysis-1', status: 'pending' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      await restoreSuggestionStatesForVersion('analysis-1', [], ['sug-2'])

      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-2', {
        status: 'rejected_applied',
        reviewedAt: expect.any(Number),
      })
    })

    it('should set other suggestions to pending status', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1', status: 'applied' },
        { id: 'sug-2', analysisId: 'analysis-1', status: 'rejected_applied' },
        { id: 'sug-3', analysisId: 'analysis-1', status: 'pending' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      await restoreSuggestionStatesForVersion('analysis-1', ['sug-1'], ['sug-2'])

      // sug-3 is not in accepted or rejected, should be set to pending
      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-3', {
        status: 'pending',
        reviewedAt: undefined,
      })
    })

    it('should handle empty acceptedIds and rejectedIds arrays', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1', status: 'applied' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      await restoreSuggestionStatesForVersion('analysis-1', [], [])

      // All suggestions should be set to pending when both arrays are empty
      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-1', {
        status: 'pending',
        reviewedAt: undefined,
      })
    })

    it('should not call update when no suggestions exist', async () => {
      mockSuggestionsToArray.mockResolvedValue([])

      await restoreSuggestionStatesForVersion('analysis-1', ['sug-1'], ['sug-2'])

      expect(mockSuggestionsUpdate).not.toHaveBeenCalled()
    })

    it('should clear reviewedAt for pending suggestions', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1', status: 'applied' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      await restoreSuggestionStatesForVersion('analysis-1', [], [])

      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-1', {
        status: 'pending',
        reviewedAt: undefined,
      })
    })

    it('should set reviewedAt for non-pending suggestions', async () => {
      const mockSuggestions = [
        { id: 'sug-1', analysisId: 'analysis-1', status: 'pending' },
        { id: 'sug-2', analysisId: 'analysis-1', status: 'pending' },
      ]
      mockSuggestionsToArray.mockResolvedValue(mockSuggestions)

      await restoreSuggestionStatesForVersion('analysis-1', ['sug-1'], ['sug-2'])

      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-1', {
        status: 'applied',
        reviewedAt: expect.any(Number),
      })
      expect(mockSuggestionsUpdate).toHaveBeenCalledWith('sug-2', {
        status: 'rejected_applied',
        reviewedAt: expect.any(Number),
      })
    })
  })
})
