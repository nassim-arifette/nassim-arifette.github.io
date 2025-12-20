import { describe, it, beforeEach, afterEach, expect } from 'vitest'
import { absoluteUrl, getSiteUrl } from './seo'

const ORIGINAL_ENV = process.env

describe('seo url helpers', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.SITE_URL
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('uses default site url when env unset', () => {
    expect(getSiteUrl()).toBe('https://nassim-arifette.github.io')
  })

  it('prefers NEXT_PUBLIC_SITE_URL over SITE_URL', () => {
    process.env.SITE_URL = 'https://site-from-backend.example'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://public.example'
    expect(getSiteUrl()).toBe('https://public.example')
  })

  it('strips trailing slashes from base url', () => {
    process.env.SITE_URL = 'https://example.org/'
    expect(getSiteUrl()).toBe('https://example.org')
  })

  it('builds absolute urls with and without leading slash', () => {
    process.env.SITE_URL = 'https://example.org'
    expect(absoluteUrl('/about')).toBe('https://example.org/about')
    expect(absoluteUrl('about')).toBe('https://example.org/about')
  })
})
