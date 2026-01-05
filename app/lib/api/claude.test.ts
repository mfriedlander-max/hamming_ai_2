import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TestResult, FailureCategory } from '@/types'

// Use vi.hoisted to ensure the mock function is available before vi.mock runs
const { mockCreateFn } = vi.hoisted(() => {
  return { mockCreateFn: vi.fn() }
})

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreateFn,
      }
    },
  }
})

// Import after mock
import { ClaudeAPIClient } from './claude'

describe('ClaudeAPIClient', () => {
  let client: ClaudeAPIClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateFn.mockReset()
    client = new ClaudeAPIClient()
  })

  describe('analyzeFailures', () => {
    const mockSystemPrompt = 'You are a helpful assistant.'
    const mockFailedTests: TestResult[] = [
      {
        id: 'test-1',
        testBatchId: 'batch-1',
        inputData: { query: 'Hello' },
        expectedBehavior: 'Should greet back',
        actualBehavior: 'Was rude',
        transcript: 'User: Hello\nAssistant: Go away.',
        status: 'fail',
        metadata: {},
      },
      {
        id: 'test-2',
        testBatchId: 'batch-1',
        inputData: { query: 'Help me' },
        expectedBehavior: 'Should offer help',
        actualBehavior: 'Ignored request',
        transcript: 'User: Help me\nAssistant: No.',
        status: 'fail',
        metadata: {},
      },
    ]

    it('should parse a valid analysis response', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: `Here is my analysis:
\`\`\`json
{
  "categories": [
    {
      "name": "Tone Issues",
      "description": "The assistant is being rude",
      "severity": "high",
      "affectedTestIds": ["test-1", "test-2"],
      "evidence": [
        {
          "testId": "test-1",
          "excerpt": "Go away.",
          "context": "Rude response to greeting"
        }
      ]
    }
  ]
}
\`\`\``,
          },
        ],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      const result = await client.analyzeFailures(mockSystemPrompt, mockFailedTests)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'category-0',
        name: 'Tone Issues',
        description: 'The assistant is being rude',
        severity: 'high',
        affectedTestIds: ['test-1', 'test-2'],
        count: 2,
      })
      expect(result[0].evidence).toHaveLength(1)
      expect(result[0].evidence[0].excerpt).toBe('Go away.')
    })

    it('should handle multiple categories', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: `\`\`\`json
{
  "categories": [
    {
      "name": "Category A",
      "description": "Desc A",
      "severity": "high",
      "affectedTestIds": ["test-1"],
      "evidence": []
    },
    {
      "name": "Category B",
      "description": "Desc B",
      "severity": "low",
      "affectedTestIds": ["test-2"],
      "evidence": []
    }
  ]
}
\`\`\``,
          },
        ],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      const result = await client.analyzeFailures(mockSystemPrompt, mockFailedTests)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('category-0')
      expect(result[1].id).toBe('category-1')
      expect(result[0].severity).toBe('high')
      expect(result[1].severity).toBe('low')
    })

    it('should throw on non-text response', async () => {
      const mockResponse = {
        content: [{ type: 'image', data: 'abc' }],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      await expect(client.analyzeFailures(mockSystemPrompt, mockFailedTests)).rejects.toThrow(
        'Unexpected response type from Claude'
      )
    })

    it('should throw on invalid JSON response', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'This is not valid JSON at all',
          },
        ],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      await expect(client.analyzeFailures(mockSystemPrompt, mockFailedTests)).rejects.toThrow(
        'Failed to parse analysis response'
      )
    })

    it('should throw on API error', async () => {
      mockCreateFn.mockRejectedValue(new Error('API rate limit exceeded'))

      await expect(client.analyzeFailures(mockSystemPrompt, mockFailedTests)).rejects.toThrow(
        'Analysis failed: API rate limit exceeded'
      )
    })
  })

  describe('generateSuggestions', () => {
    const mockSystemPrompt = 'You are a helpful assistant.'
    const mockCategory: FailureCategory = {
      id: 'cat-1',
      name: 'Tone Issues',
      description: 'The assistant is rude',
      severity: 'high',
      affectedTestIds: ['test-1'],
      evidence: [
        {
          testId: 'test-1',
          excerpt: 'Go away.',
          context: 'Rude dismissal',
        },
      ],
      count: 1,
    }
    const mockAllTests: TestResult[] = [
      {
        id: 'test-1',
        testBatchId: 'batch-1',
        inputData: {},
        expectedBehavior: 'Be polite',
        actualBehavior: 'Was rude',
        transcript: 'User: Hi\nAssistant: Go away.',
        status: 'fail',
        metadata: {},
      },
      {
        id: 'test-2',
        testBatchId: 'batch-1',
        inputData: {},
        expectedBehavior: 'Be helpful',
        actualBehavior: 'Was helpful',
        transcript: 'User: Help\nAssistant: Sure, happy to help!',
        status: 'pass',
        metadata: {},
      },
    ]

    it('should parse a valid suggestion response', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: `\`\`\`json
{
  "suggestions": [
    {
      "type": "add",
      "targetSection": "beginning",
      "proposedText": "Always maintain a friendly and helpful tone.",
      "reason": "Adding explicit tone guidance",
      "linkedTestIds": ["test-1"]
    }
  ]
}
\`\`\``,
          },
        ],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      const result = await client.generateSuggestions(mockSystemPrompt, mockCategory, mockAllTests)

      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0]).toMatchObject({
        type: 'add',
        targetSection: 'beginning',
        proposedText: 'Always maintain a friendly and helpful tone.',
        linkedTestIds: ['test-1'],
      })
    })

    it('should handle replace type suggestions', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: `\`\`\`json
{
  "suggestions": [
    {
      "type": "replace",
      "targetSection": "greeting section",
      "originalText": "You are an assistant.",
      "proposedText": "You are a friendly, helpful assistant.",
      "reason": "More explicit about tone",
      "linkedTestIds": ["test-1"]
    }
  ]
}
\`\`\``,
          },
        ],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      const result = await client.generateSuggestions(mockSystemPrompt, mockCategory, mockAllTests)

      expect(result.suggestions[0].type).toBe('replace')
      expect(result.suggestions[0].originalText).toBe('You are an assistant.')
    })

    it('should throw on invalid suggestion JSON', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'not json' }],
      }

      mockCreateFn.mockResolvedValue(mockResponse)

      await expect(
        client.generateSuggestions(mockSystemPrompt, mockCategory, mockAllTests)
      ).rejects.toThrow('Failed to parse suggestion response')
    })
  })
})
