import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Folder, Project } from '@/types'
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_NAME } from '@/types/folder'

// Create mock functions
const mockFoldersAdd = vi.fn()
const mockFoldersGet = vi.fn()
const mockFoldersUpdate = vi.fn()
const mockFoldersDelete = vi.fn()
const mockFoldersToArray = vi.fn()
const mockFoldersOrderBy = vi.fn()
const mockFoldersWhere = vi.fn()

const mockProjectsWhere = vi.fn()
const mockProjectsModify = vi.fn()
const mockProjectsCount = vi.fn()

// Mock modules before importing
vi.mock('./client', () => ({
  db: {
    folders: {
      add: (data: Folder) => mockFoldersAdd(data),
      get: (id: string) => mockFoldersGet(id),
      update: (id: string, data: Partial<Folder>) => mockFoldersUpdate(id, data),
      delete: (id: string) => mockFoldersDelete(id),
      toArray: () => mockFoldersToArray(),
      orderBy: (field: string) => {
        mockFoldersOrderBy(field)
        return {
          toArray: () => mockFoldersToArray(),
        }
      },
      where: (field: string) => {
        mockFoldersWhere(field)
        return {
          equals: (value: string) => ({
            toArray: () => mockFoldersToArray(),
          }),
        }
      },
    },
    projects: {
      where: (field: string) => {
        mockProjectsWhere(field)
        return {
          equals: (value: string) => ({
            modify: (changes: Partial<Project> | ((project: Project) => void)) => mockProjectsModify(changes),
            count: () => mockProjectsCount(),
          }),
        }
      },
    },
  },
}))

vi.mock('nanoid', () => ({
  nanoid: () => 'mock-folder-id',
}))

// Import after mocks are set up
import {
  createFolder,
  getFolder,
  getAllFolders,
  getFoldersByParent,
  updateFolder,
  deleteFolder,
  ensureDefaultFolder,
  getProjectCountInFolder,
  CannotDeleteDefaultFolderError,
  FolderNotFoundError,
} from './folders'

describe('folders database operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFoldersAdd.mockResolvedValue('mock-folder-id')
    mockFoldersGet.mockResolvedValue(undefined)
    mockFoldersUpdate.mockResolvedValue(1)
    mockFoldersDelete.mockResolvedValue(undefined)
    mockFoldersToArray.mockResolvedValue([])
    mockProjectsModify.mockResolvedValue(0)
    mockProjectsCount.mockResolvedValue(0)
  })

  describe('ensureDefaultFolder', () => {
    it('should return existing default folder if it exists', async () => {
      const existingFolder: Folder = {
        id: DEFAULT_FOLDER_ID,
        name: DEFAULT_FOLDER_NAME,
        createdAt: 1000,
        updatedAt: 1000,
      }
      mockFoldersGet.mockResolvedValue(existingFolder)

      const result = await ensureDefaultFolder()

      expect(result).toEqual(existingFolder)
      expect(mockFoldersAdd).not.toHaveBeenCalled()
    })

    it('should create default folder if it does not exist', async () => {
      mockFoldersGet.mockResolvedValue(undefined)

      const result = await ensureDefaultFolder()

      expect(result.id).toBe(DEFAULT_FOLDER_ID)
      expect(result.name).toBe(DEFAULT_FOLDER_NAME)
      expect(mockFoldersAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: DEFAULT_FOLDER_ID,
          name: DEFAULT_FOLDER_NAME,
        })
      )
    })
  })

  describe('createFolder', () => {
    it('should create a folder with correct structure', async () => {
      const result = await createFolder('Test Folder')

      expect(result).toMatchObject({
        id: 'mock-folder-id',
        name: 'Test Folder',
      })
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.parentId).toBeUndefined()
    })

    it('should create a folder with parentId', async () => {
      const result = await createFolder('Child Folder', 'parent-folder-id')

      expect(result).toMatchObject({
        id: 'mock-folder-id',
        name: 'Child Folder',
        parentId: 'parent-folder-id',
      })
    })

    it('should call db.folders.add with the folder', async () => {
      await createFolder('Test Folder')

      expect(mockFoldersAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-folder-id',
          name: 'Test Folder',
        })
      )
    })
  })

  describe('getFolder', () => {
    it('should return folder when found', async () => {
      const mockFolder: Folder = {
        id: 'folder-1',
        name: 'My Folder',
        createdAt: 1000,
        updatedAt: 1000,
      }
      mockFoldersGet.mockResolvedValue(mockFolder)

      const result = await getFolder('folder-1')

      expect(result).toEqual(mockFolder)
      expect(mockFoldersGet).toHaveBeenCalledWith('folder-1')
    })

    it('should return undefined when not found', async () => {
      mockFoldersGet.mockResolvedValue(undefined)

      const result = await getFolder('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('getAllFolders', () => {
    it('should return all folders ordered by createdAt', async () => {
      const mockFolders: Folder[] = [
        { id: 'folder-1', name: 'First', createdAt: 1000, updatedAt: 1000 },
        { id: 'folder-2', name: 'Second', createdAt: 2000, updatedAt: 2000 },
      ]
      mockFoldersToArray.mockResolvedValue(mockFolders)

      const result = await getAllFolders()

      expect(result).toEqual(mockFolders)
      expect(mockFoldersOrderBy).toHaveBeenCalledWith('createdAt')
    })

    it('should return empty array when no folders exist', async () => {
      mockFoldersToArray.mockResolvedValue([])

      const result = await getAllFolders()

      expect(result).toEqual([])
    })
  })

  describe('getFoldersByParent', () => {
    it('should return root-level folders when parentId is undefined', async () => {
      const mockFolders: Folder[] = [
        { id: 'folder-1', name: 'Root Folder', createdAt: 1000, updatedAt: 1000 },
        { id: 'folder-2', name: 'Child Folder', parentId: 'folder-1', createdAt: 2000, updatedAt: 2000 },
      ]
      mockFoldersToArray.mockResolvedValue(mockFolders)

      const result = await getFoldersByParent(undefined)

      // Should only return folders without parentId
      expect(result).toEqual([mockFolders[0]])
    })

    it('should return child folders when parentId is provided', async () => {
      const mockFolders: Folder[] = [
        { id: 'folder-2', name: 'Child Folder', parentId: 'folder-1', createdAt: 2000, updatedAt: 2000 },
      ]
      mockFoldersToArray.mockResolvedValue(mockFolders)

      const result = await getFoldersByParent('folder-1')

      expect(result).toEqual(mockFolders)
      expect(mockFoldersWhere).toHaveBeenCalledWith('parentId')
    })
  })

  describe('updateFolder', () => {
    it('should update folder name', async () => {
      mockFoldersGet.mockResolvedValue({
        id: 'folder-1',
        name: 'Old Name',
        createdAt: 1000,
        updatedAt: 1000,
      })

      await updateFolder('folder-1', { name: 'New Name' })

      expect(mockFoldersUpdate).toHaveBeenCalledWith('folder-1', {
        name: 'New Name',
        updatedAt: expect.any(Number),
      })
    })

    it('should update folder parentId', async () => {
      mockFoldersGet.mockResolvedValue({
        id: 'folder-1',
        name: 'Folder',
        createdAt: 1000,
        updatedAt: 1000,
      })

      await updateFolder('folder-1', { parentId: 'new-parent' })

      expect(mockFoldersUpdate).toHaveBeenCalledWith('folder-1', {
        parentId: 'new-parent',
        updatedAt: expect.any(Number),
      })
    })

    it('should throw FolderNotFoundError when folder does not exist', async () => {
      mockFoldersGet.mockResolvedValue(undefined)

      await expect(updateFolder('nonexistent', { name: 'New Name' })).rejects.toThrow(
        FolderNotFoundError
      )
    })
  })

  describe('deleteFolder', () => {
    it('should throw CannotDeleteDefaultFolderError when deleting default folder', async () => {
      await expect(deleteFolder(DEFAULT_FOLDER_ID)).rejects.toThrow(
        CannotDeleteDefaultFolderError
      )
      expect(mockFoldersDelete).not.toHaveBeenCalled()
    })

    it('should throw FolderNotFoundError when folder does not exist', async () => {
      mockFoldersGet.mockResolvedValue(undefined)

      await expect(deleteFolder('nonexistent')).rejects.toThrow(FolderNotFoundError)
      expect(mockFoldersDelete).not.toHaveBeenCalled()
    })

    it('should move projects to default folder before deleting', async () => {
      // Mock: folder exists
      mockFoldersGet.mockImplementation((id: string) => {
        if (id === 'folder-to-delete') {
          return Promise.resolve({
            id: 'folder-to-delete',
            name: 'To Delete',
            createdAt: 1000,
            updatedAt: 1000,
          })
        }
        if (id === DEFAULT_FOLDER_ID) {
          return Promise.resolve({
            id: DEFAULT_FOLDER_ID,
            name: DEFAULT_FOLDER_NAME,
            createdAt: 1000,
            updatedAt: 1000,
          })
        }
        return Promise.resolve(undefined)
      })

      await deleteFolder('folder-to-delete')

      // Should move projects first
      expect(mockProjectsWhere).toHaveBeenCalledWith('folderId')
      expect(mockProjectsModify).toHaveBeenCalledWith({
        folderId: DEFAULT_FOLDER_ID,
        updatedAt: expect.any(Number),
      })

      // Then delete the folder
      expect(mockFoldersDelete).toHaveBeenCalledWith('folder-to-delete')
    })

    it('should ensure default folder exists before moving projects', async () => {
      // First call for folder-to-delete returns the folder
      // Second call for DEFAULT_FOLDER_ID returns undefined (needs creation)
      let callCount = 0
      mockFoldersGet.mockImplementation((id: string) => {
        callCount++
        if (id === 'folder-to-delete') {
          return Promise.resolve({
            id: 'folder-to-delete',
            name: 'To Delete',
            createdAt: 1000,
            updatedAt: 1000,
          })
        }
        if (id === DEFAULT_FOLDER_ID) {
          // First time it's called for ensureDefaultFolder, return undefined
          // to trigger creation
          return Promise.resolve(undefined)
        }
        return Promise.resolve(undefined)
      })

      await deleteFolder('folder-to-delete')

      // Should have tried to ensure default folder exists
      expect(mockFoldersGet).toHaveBeenCalledWith(DEFAULT_FOLDER_ID)
      // Should have created default folder since it didn't exist
      expect(mockFoldersAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          id: DEFAULT_FOLDER_ID,
          name: DEFAULT_FOLDER_NAME,
        })
      )
    })

    it('should not delete projects when deleting folder - only moves them', async () => {
      mockFoldersGet.mockImplementation((id: string) => {
        if (id === 'folder-to-delete') {
          return Promise.resolve({
            id: 'folder-to-delete',
            name: 'To Delete',
            createdAt: 1000,
            updatedAt: 1000,
          })
        }
        if (id === DEFAULT_FOLDER_ID) {
          return Promise.resolve({
            id: DEFAULT_FOLDER_ID,
            name: DEFAULT_FOLDER_NAME,
            createdAt: 1000,
            updatedAt: 1000,
          })
        }
        return Promise.resolve(undefined)
      })

      await deleteFolder('folder-to-delete')

      // Verify projects.modify was called (moving projects), not projects.delete
      expect(mockProjectsModify).toHaveBeenCalled()
      // The modify should set folderId to DEFAULT_FOLDER_ID
      expect(mockProjectsModify).toHaveBeenCalledWith({
        folderId: DEFAULT_FOLDER_ID,
        updatedAt: expect.any(Number),
      })
    })
  })

  describe('getProjectCountInFolder', () => {
    it('should return count of projects in folder', async () => {
      mockProjectsCount.mockResolvedValue(5)

      const result = await getProjectCountInFolder('folder-1')

      expect(result).toBe(5)
      expect(mockProjectsWhere).toHaveBeenCalledWith('folderId')
    })

    it('should return 0 when folder is empty', async () => {
      mockProjectsCount.mockResolvedValue(0)

      const result = await getProjectCountInFolder('empty-folder')

      expect(result).toBe(0)
    })
  })
})
