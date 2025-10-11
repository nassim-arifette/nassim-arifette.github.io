import { describe, it, expect } from 'vitest'
import { cn, matchTagFromSlug, slugifyTag } from './utils'

describe('cn', () => {
  it('joins truthy class names with spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', '', false, undefined, null, 'b')).toBe('a b')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})

describe('slugifyTag', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugifyTag('Machine Learning')).toBe('machine-learning')
  })

  it('strips diacritics and punctuation', () => {
    expect(slugifyTag('École & AI!')).toBe('ecole-ai')
  })
})

describe('matchTagFromSlug', () => {
  it('returns the exact tag that matches a slug', () => {
    const tags = ['Machine Learning', 'Computer Vision']
    expect(matchTagFromSlug('computer-vision', tags)).toBe('Computer Vision')
  })

  it('returns undefined when no tag matches', () => {
    expect(matchTagFromSlug('nonexistent', ['A', 'B'])).toBeUndefined()
  })
})
