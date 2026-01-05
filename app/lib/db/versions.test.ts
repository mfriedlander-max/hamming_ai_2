import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create mock functions
const mockVersionsAdd = vi.fn()
const mockVersionsGet = vi.fn()
const mockVersionsSortBy = vi.fn()
const mockCreateAuditEntry = vi.fn().mockResolvedValue(undefined)

// Mock modules before importing
vi.mock('./client', () => ({
  db: {
    versions: {
      add: (data: any) => mockVersionsAdd(data),
      get: (id: string) => mockVersionsGet(id),
      where: () => ({
        equals: () => ({
          sortBy: (field: string) => mockVersionsSortBy(field),
        }),
      }),
    },
  },
}))

vi.mock('./auditLog', () => ({
  createAuditEntry: (data: any) => mockCreateAuditEntry(data),
}))

vi.mock('nanoid', () => ({
  nanoid: () => 'mock-version-id',
}))

// Import after mocks
import { createVersion, getVersion, getVersionsByProject, getLatestVersion } from './versions'

describe('versions database operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVersionsAdd.mockResolvedValue('mock-version-id')
    mockVersionsGet.mockResolvedValue(undefined)
    mockVersionsSortBy.mockResolvedValue([])
  })

  describe('createVersion', () => {
    const mockVersionData = {
      projectId: 'project-1',
      content: 'New prompt content',
      createdBy: 'user' as const,
    }

    it('should create a version with correct structure', async () => {
      const result = await createVersion(mockVersionData)

      expect(result).toMatchObject({
        id: 'mock-version-id',
        projectId: 'project-1',
        content: 'New prompt content',
        createdBy: 'user',
        versionNumber: 1,
      })
      expect(result.createdAt).toBeDefined()
      expect(typeof result.createdAt).toBe('number')
    })

    it('should auto-increment version number', async () => {
      // Simulate 2 existing versions
      mockVersionsSortBy.mockResolvedValue([
        { id: 'v1', versionNumber: 1 },
        { id: 'v2', versionNumber: 2 },
      ])

      const result = await createVersion(mockVersionData)

      expect(result.versionNumber).toBe(3)
    })

    it('should include optional fields when provided', async () => {
      const result = await createVersion({
        ...mockVersionData,
        changedFrom: 'previous-version-id',
        appliedSuggestions: ['sug-1', 'sug-2'],
        changesSummary: 'Applied 2 suggestions',
        analysisId: 'analysis-1',
      })

      expect(result.changedFrom).toBe('previous-version-id')
      expect(result.appliedSuggestions).toEqual(['sug-1', 'sug-2'])
      expect(result.changesSummary).toBe('Applied 2 suggestions')
      expect(result.analysisId).toBe('analysis-1')
    })

    it('should add version to database', async () => {
      await createVersion(mockVersionData)

      expect(mockVersionsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-version-id',
          projectId: 'project-1',
        })
      )
    })

    it('should create audit entry', async () => {
      await createVersion(mockVersionData)

      expect(mockCreateAuditEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created_version',
          actor: 'user',
          details: expect.objectContaining({
            versionNumber: 1,
          }),
        })
      )
    })

    it('should handle system-created versions', async () => {
      const result = await createVersion({
        ...mockVersionData,
        createdBy: 'system',
      })

      expect(result.createdBy).toBe('system')
    })
  })

  describe('getVersion', () => {
    it('should return version when found', async () => {
      const mockVersion = {
        id: 'version-1',
        projectId: 'project-1',
        content: 'Content',
        versionNumber: 1,
      }
      mockVersionsGet.mockResolvedValue(mockVersion)

      const result = await getVersion('version-1')

      expect(result).toEqual(mockVersion)
      expect(mockVersionsGet).toHaveBeenCalledWith('version-1')
    })

    it('should return undefined when not found', async () => {
      mockVersionsGet.mockResolvedValue(undefined)

      const result = await getVersion('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getVersionsByProject', () => {
    it('should return versions sorted by version number', async () => {
      const mockVersions = [
        { id: 'v1', versionNumber: 1 },
        { id: 'v2', versionNumber: 2 },
        { id: 'v3', versionNumber: 3 },
      ]
      mockVersionsSortBy.mockResolvedValue(mockVersions)

      const result = await getVersionsByProject('project-1')

      expect(result).toEqual(mockVersions)
      expect(mockVersionsSortBy).toHaveBeenCalledWith('versionNumber')
    })

    it('should return empty array when no versions exist', async () => {
      mockVersionsSortBy.mockResolvedValue([])

      const result = await getVersionsByProject('project-1')

      expect(result).toEqual([])
    })
  })

  describe('getLatestVersion', () => {
    it('should return the last (latest) version', async () => {
      const mockVersions = [
        { id: 'v1', versionNumber: 1 },
        { id: 'v2', versionNumber: 2 },
        { id: 'v3', versionNumber: 3 },
      ]
      mockVersionsSortBy.mockResolvedValue(mockVersions)

      const result = await getLatestVersion('project-1')

      expect(result).toEqual({ id: 'v3', versionNumber: 3 })
    })

    it('should return undefined when no versions exist', async () => {
      mockVersionsSortBy.mockResolvedValue([])

      const result = await getLatestVersion('project-1')

      expect(result).toBeUndefined()
    })

    it('should return only version when single version exists', async () => {
      const mockVersions = [{ id: 'v1', versionNumber: 1 }]
      mockVersionsSortBy.mockResolvedValue(mockVersions)

      const result = await getLatestVersion('project-1')

      expect(result).toEqual({ id: 'v1', versionNumber: 1 })
    })
  })
})
