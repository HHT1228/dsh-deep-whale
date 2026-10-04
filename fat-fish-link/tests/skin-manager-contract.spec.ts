import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../src/client/fat-fish-link.module.css', import.meta.url), 'utf8')

describe('skin-manager stylesheet contract', () => {
  it('supports each CHUBBY FISH presentation toggle', () => {
    expect(css).toContain("data-dsh-whale-fatfish-background='hidden'")
    expect(css).toContain("data-dsh-whale-fatfish-pricing='hidden'")
    expect(css).toContain("data-dsh-whale-fatfish-settings-layout='centered'")
  })

  it('lets the shared timer hide only illustration layers', () => {
    expect(css).toContain("data-dsh-whale-fatfish-art='hidden'")
    expect(css).toContain(':is(.lightSceneLayer, .darkSceneLayer)')
  })
})
