import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FailureCategory } from '@/types'

// Create mock functions
const mockAdd = vi.fn()
const mockGet = vi.fn()
const mockToArray = vi.fn()
const mockCreateAuditEntry = vi.fn().mockResolvedValue(undefined)

// Mock modules before importing
vi.mock('./client', () => ({
  db: {
    analyses: {
      add: (data: any) => mockAdd(data),
      get: (id: string) => mockGet(id),
      where: () => ({
        equals: () => ({
          reverse: () => ({
            toArray: () => mockToArray(),
          }),
        }),
      }),
    },
  },
}))

vi.mock('./auditLog', () => ({
  createAuditEntry: (data: any) => mockCreateAuditEntry(data),
}))

vi.mock('nanoid', () => ({
  nanoid: () => 'mock-analysis-id',
}))

// Import after mocks are set up
import { createAnalysis, getAnalysis, getAnalysesByProject, getLatestAnalysis } from './analyses'

describe('analyses database operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdd.mockResolvedValue('mock-analysis-id')
    mockGet.mockResolvedValue(undefined)
    mockToArray.mockResolvedValue([])
  })

  describe('createAnalysis', () => {
    const mockCategories: FailureCategory[] = [
      {
        id: 'cat-1',
        name: 'Test Category',
        description: 'A test category',
        severity: 'high',
        affectedTestIds: ['test-1'],
        evidence: [{ testId: 'test-1', excerpt: 'excerpt' }],
        count: 1,
      },
    ]

    const mockAnalysisData = {
      projectId: 'project-1',
      testBatchId: 'batch-1',
      systemPrompt: 'You are helpful.',
      categories: mockCategories,
      metadata: {
        modelUsed: 'claude-sonnet-4',
        durationMs: 1500,
      },
    }

    it('should create an analysis with correct structure', async () => {
      const result = await createAnalysis(mockAnalysisData)

      expect(result).toMatchObject({
        id: 'mock-analysis-id',
        projectId: 'project-1',
        testBatchId: 'batch-1',
        systemPrompt: 'You are helpful.',
        categories: mockCategories,
        metadata: {
          modelUsed: 'claude-sonnet-4',
          durationMs: 1500,
        },
      })
      expect(result.analyzedAt).toBeDefined()
      expect(typeof result.analyzedAt).toBe('number')
    })

    it('should call db.analyses.add with the analysis', async () => {
      await createAnalysis(mockAnalysisData)

      expect(mockAdd).toHaveBeenCalledTimes(1)
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-analysis-id',
          projectId: 'project-1',
        })
      )
    })

    it('should create audit entries', async () => {
      await createAnalysis(mockAnalysisData)

      // Should create two audit entries: uploaded_prompt and analyzed
      expect(mockCreateAuditEntry).toHaveBeenCalledTimes(2)
      expect(mockCreateAuditEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'uploaded_prompt',
          actor: 'user',
        })
      )
      expect(mockCreateAuditEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'analyzed',
          actor: 'system',
        })
      )
    })

    it('should include raw Claude response if provided', async () => {
      const result = await createAnalysis({
        ...mockAnalysisData,
        rawClaudeResponse: '{"raw": "response"}',
      })

      expect(result.rawClaudeResponse).toBe('{"raw": "response"}')
    })
  })

  describe('getAnalysis', () => {
    it('should return analysis when found', async () => {
      const mockAnalysis = {
        id: 'analysis-1',
        projectId: 'project-1',
        categories: [],
      }
      mockGet.mockResolvedValue(mockAnalysis)

      const result = await getAnalysis('analysis-1')

      expect(result).toEqual(mockAnalysis)
      expect(mockGet).toHaveBeenCalledWith('analysis-1')
    })

    it('should return undefined when not found', async () => {
      mockGet.mockResolvedValue(undefined)

      const result = await getAnalysis('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getAnalysesByProject', () => {
    it('should return analyses for a project in reverse order', async () => {
      const mockAnalyses = [
        { id: 'analysis-2', analyzedAt: 2000 },
        { id: 'analysis-1', analyzedAt: 1000 },
      ]
      mockToArray.mockResolvedValue(mockAnalyses)

      const result = await getAnalysesByProject('project-1')

      expect(result).toEqual(mockAnalyses)
    })

    it('should return empty array when no analyses exist', async () => {
      mockToArray.mockResolvedValue([])

      const result = await getAnalysesByProject('project-1')

      expect(result).toEqual([])
    })
  })

  describe('getLatestAnalysis', () => {
    it('should return the first (latest) analysis', async () => {
      const mockAnalyses = [
        { id: 'analysis-2', analyzedAt: 2000 },
        { id: 'analysis-1', analyzedAt: 1000 },
      ]
      mockToArray.mockResolvedValue(mockAnalyses)

      const result = await getLatestAnalysis('project-1')

      expect(result).toEqual({ id: 'analysis-2', analyzedAt: 2000 })
    })

    it('should return undefined when no analyses exist', async () => {
      mockToArray.mockResolvedValue([])

      const result = await getLatestAnalysis('project-1')

      expect(result).toBeUndefined()
    })
  })
})
