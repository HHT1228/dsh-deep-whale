// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { installFatFishScene } from '../src/client/scene.ts'

afterEach(() => {
  document.body.innerHTML = ''
  delete document.body.dataset.fatfishScene
})

describe('CHUBBY FISH LINK scene controller', () => {
  it('mirrors the conversation phase onto a stable body attribute', async () => {
    document.body.innerHTML = '<div data-phase="hero"><div><div data-conversation-scroll></div></div></div>'
    const dispose = installFatFishScene(document.body)

    expect(document.body.dataset.fatfishScene).toBe('hero')

    const root = document.querySelector<HTMLElement>('[data-phase="hero"]')!
    root.dataset.phase = 'active'
    await Promise.resolve()
    expect(document.body.dataset.fatfishScene).toBe('active')

    dispose()
    expect(document.body.dataset.fatfishScene).toBeUndefined()
  })

  it('falls back to hero when no conversation root is present', () => {
    document.body.innerHTML = '<div></div>'
    const dispose = installFatFishScene(document.body)
    expect(document.body.dataset.fatfishScene).toBe('hero')
    dispose()
  })
})
