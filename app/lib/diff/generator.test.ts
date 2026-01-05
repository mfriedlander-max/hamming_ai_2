import { describe, it, expect } from 'vitest'
import { generateDiff, applyChange } from './generator'

describe('generateDiff', () => {
  describe('basic diff generation', () => {
    it('should generate a patch for simple text change', () => {
      const original = 'Hello world'
      const modified = 'Hello universe'

      const result = generateDiff(original, modified)

      expect(result.patch).toContain('---')
      expect(result.patch).toContain('+++')
      expect(result.patch).toContain('-Hello world')
      expect(result.patch).toContain('+Hello universe')
    })

    it('should return empty patch for identical texts', () => {
      const text = 'Same text'

      const result = generateDiff(text, text)

      expect(result.additions).toBe(0)
      expect(result.deletions).toBe(0)
    })

    it('should count additions correctly', () => {
      const original = 'Line 1'
      const modified = 'Line 1\nLine 2\nLine 3'

      const result = generateDiff(original, modified)

      expect(result.additions).toBeGreaterThan(0)
    })

    it('should count deletions correctly', () => {
      const original = 'Line 1\nLine 2\nLine 3'
      const modified = 'Line 1'

      const result = generateDiff(original, modified)

      expect(result.deletions).toBeGreaterThan(0)
    })
  })

  describe('hunk parsing', () => {
    it('should parse hunks from patch', () => {
      const original = 'Line 1\nLine 2\nLine 3'
      const modified = 'Line 1\nModified Line 2\nLine 3'

      const result = generateDiff(original, modified)

      expect(result.hunks.length).toBeGreaterThan(0)
      expect(result.hunks[0]).toHaveProperty('oldStart')
      expect(result.hunks[0]).toHaveProperty('newStart')
      expect(result.hunks[0]).toHaveProperty('lines')
    })

    it('should capture hunk line numbers', () => {
      const original = 'A\nB\nC\nD\nE'
      const modified = 'A\nB\nX\nD\nE'

      const result = generateDiff(original, modified)

      if (result.hunks.length > 0) {
        expect(typeof result.hunks[0].oldStart).toBe('number')
        expect(typeof result.hunks[0].oldLines).toBe('number')
        expect(typeof result.hunks[0].newStart).toBe('number')
        expect(typeof result.hunks[0].newLines).toBe('number')
      }
    })

    it('should include diff lines in hunks', () => {
      const original = 'Old line'
      const modified = 'New line'

      const result = generateDiff(original, modified)

      if (result.hunks.length > 0) {
        const allLines = result.hunks.flatMap((h) => h.lines)
        const hasAddition = allLines.some((l) => l.startsWith('+'))
        const hasDeletion = allLines.some((l) => l.startsWith('-'))
        expect(hasAddition || hasDeletion).toBe(true)
      }
    })
  })

  describe('multiline diffs', () => {
    it('should handle multiline additions', () => {
      const original = 'Intro\n\nConclusion'
      const modified = 'Intro\n\nMiddle paragraph 1\nMiddle paragraph 2\n\nConclusion'

      const result = generateDiff(original, modified)

      expect(result.additions).toBeGreaterThan(0)
      expect(result.patch).toContain('+Middle paragraph')
    })

    it('should handle multiline deletions', () => {
      const original = 'Line A\nLine B\nLine C\nLine D'
      const modified = 'Line A\nLine D'

      const result = generateDiff(original, modified)

      expect(result.deletions).toBeGreaterThan(0)
    })
  })
})

describe('applyChange', () => {
  const originalPrompt = 'You are a helpful assistant.\n\nBe concise.'

  describe('replace operation', () => {
    it('should replace text correctly', () => {
      const result = applyChange(
        originalPrompt,
        'replace',
        'helpful assistant',
        'friendly helper'
      )

      expect(result).toBe('You are a friendly helper.\n\nBe concise.')
    })

    it('should throw error when originalText not provided', () => {
      expect(() => {
        applyChange(originalPrompt, 'replace', undefined, 'new text')
      }).toThrow('originalText required for replace operation')
    })
  })

  describe('remove operation', () => {
    it('should remove text correctly', () => {
      const result = applyChange(originalPrompt, 'remove', '\n\nBe concise.', '')

      expect(result).toBe('You are a helpful assistant.')
    })

    it('should throw error when originalText not provided', () => {
      expect(() => {
        applyChange(originalPrompt, 'remove', undefined, '')
      }).toThrow('originalText required for remove operation')
    })
  })

  describe('add operation', () => {
    it('should append text at end', () => {
      const result = applyChange(originalPrompt, 'add', undefined, 'New instruction.')

      expect(result).toBe(originalPrompt + '\n\n' + 'New instruction.')
    })

    it('should work with targetSection (currently appends)', () => {
      const result = applyChange(
        originalPrompt,
        'add',
        undefined,
        'New instruction.',
        'after introduction'
      )

      expect(result).toContain('New instruction.')
    })
  })

  describe('error handling', () => {
    it('should throw on unknown change type', () => {
      expect(() => {
        applyChange(originalPrompt, 'unknown' as any, undefined, 'text')
      }).toThrow('Unknown change type: unknown')
    })
  })
})
