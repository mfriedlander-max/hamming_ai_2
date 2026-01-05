import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Dexie (IndexedDB)
vi.mock('dexie', () => {
  const mockTable = {
    add: vi.fn().mockResolvedValue('mock-id'),
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue('mock-id'),
    delete: vi.fn().mockResolvedValue(undefined),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue([]),
    first: vi.fn().mockResolvedValue(null),
    orderBy: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
  }

  return {
    default: class MockDexie {
      version() {
        return { stores: () => this }
      }
      table() {
        return mockTable
      }
      projects = mockTable
      testBatches = mockTable
      testResults = mockTable
      analyses = mockTable
      suggestions = mockTable
      promptVersions = mockTable
      auditLogs = mockTable
    },
  }
})

// Mock fetch for Claude API calls
global.fetch = vi.fn()

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
