import { describe, it, expect } from 'vitest'
import { normalizeText } from './search'

describe('normalizeText', () => {
  it('lowercases and trims input', () => {
    expect(normalizeText('  Hello WORLD  ')).toBe('hello world')
  })

  it('removes diacritics', () => {
    expect(normalizeText('Café résumé naïve fiancée')).toBe('cafe resume naive fiancee')
  })

  it('replaces non-alphanumeric characters with spaces and collapses whitespace', () => {
    expect(normalizeText('hello, world! 42\nnew\tline')).toBe('hello world 42 new line')
  })
})

