import { describe, expect, it } from 'vitest'
import { isProjectLinkReady } from './project-links'

describe('isProjectLinkReady', () => {
  it('accepts local and external destinations', () => {
    expect(isProjectLinkReady('/project-report.pdf')).toBe(true)
    expect(isProjectLinkReady('https://github.com/example/project')).toBe(true)
  })

  it('rejects missing and placeholder destinations', () => {
    expect(isProjectLinkReady(undefined)).toBe(false)
    expect(isProjectLinkReady('https://arxiv.org/...')).toBe(false)
    expect(isProjectLinkReady('https://github.com/you/project')).toBe(false)
  })
})
