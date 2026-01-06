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

    it('should create a version with correct structure starting at V0', async () => {
      const result = await createVersion(mockVersionData)

      expect(result).toMatchObject({
        id: 'mock-version-id',
        projectId: 'project-1',
        content: 'New prompt content',
        createdBy: 'user',
        versionNumber: 0, // V0-based versioning: first version is 0
      })
      expect(result.createdAt).toBeDefined()
      expect(typeof result.createdAt).toBe('number')
    })

    it('should auto-increment version number with V0-based numbering', async () => {
      // Simulate 2 existing versions (V0 and V1)
      mockVersionsSortBy.mockResolvedValue([
        { id: 'v0', versionNumber: 0 },
        { id: 'v1', versionNumber: 1 },
      ])

      const result = await createVersion(mockVersionData)

      // With 2 existing versions, next version should be V2
      expect(result.versionNumber).toBe(2)
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

    it('should create audit entry with V0 for first version', async () => {
      await createVersion(mockVersionData)

      expect(mockCreateAuditEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created_version',
          actor: 'user',
          details: expect.objectContaining({
            versionNumber: 0, // V0-based versioning
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

    it('should create V0 as initial version for new project', async () => {
      // No existing versions
      mockVersionsSortBy.mockResolvedValue([])

      const result = await createVersion({
        projectId: 'new-project',
        content: 'Initial prompt content',
        createdBy: 'user',
        changesSummary: 'Initial prompt',
      })

      expect(result.versionNumber).toBe(0)
      expect(result.changesSummary).toBe('Initial prompt')
      expect(result.createdBy).toBe('user')
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
        { id: 'v0', versionNumber: 0 },
        { id: 'v1', versionNumber: 1 },
        { id: 'v2', versionNumber: 2 },
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
        { id: 'v0', versionNumber: 0 },
        { id: 'v1', versionNumber: 1 },
        { id: 'v2', versionNumber: 2 },
      ]
      mockVersionsSortBy.mockResolvedValue(mockVersions)

      const result = await getLatestVersion('project-1')

      expect(result).toEqual({ id: 'v2', versionNumber: 2 })
    })

    it('should return undefined when no versions exist', async () => {
      mockVersionsSortBy.mockResolvedValue([])

      const result = await getLatestVersion('project-1')

      expect(result).toBeUndefined()
    })

    it('should return V0 when single version exists', async () => {
      const mockVersions = [{ id: 'v0', versionNumber: 0 }]
      mockVersionsSortBy.mockResolvedValue(mockVersions)

      const result = await getLatestVersion('project-1')

      expect(result).toEqual({ id: 'v0', versionNumber: 0 })
    })
  })
})
