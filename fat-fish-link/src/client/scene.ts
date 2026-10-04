/**
 * CHUBBY FISH LINK scene controller.
 *
 * The hero/active background crossfade in the stylesheet is driven by a stable
 * body-level attribute. DSH may replace the conversation root node when a
 * session starts, so relying on `:has([data-phase=...])` alone can skip the
 * transition. This controller watches for the conversation root and mirrors its
 * phase onto `body[data-fatfish-scene]`, which survives node replacement.
 * @module @deepseek-ai/dsh-client-ui-skin-fat-fish-link/client/scene
 */

import { hasMutationOutsideTranscript } from './mutation-filter.ts'

const CONVERSATION_SCROLL_SELECTOR = '[data-conversation-scroll]'

function conversationRoot(body: HTMLElement): HTMLElement | null {
  for (const candidate of body.querySelectorAll<HTMLElement>('[data-phase]')) {
    const scrollport = candidate.querySelector<HTMLElement>(CONVERSATION_SCROLL_SELECTOR)
    if (scrollport?.closest('[data-phase]') === candidate) return candidate
  }
  return null
}

/** Install the body-level scene marker used by the background crossfade. */
export function installFatFishScene(body: HTMLElement): () => void {
  const sync = (): void => {
    const root = conversationRoot(body)
    const phase = root?.dataset.phase
    const scene = phase === 'settling' || phase === 'active' ? 'active' : 'hero'
    if (body.dataset.fatfishScene !== scene) body.dataset.fatfishScene = scene
  }

  const observer = new MutationObserver((records) => {
    if (hasMutationOutsideTranscript(records)) sync()
  })
  observer.observe(body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-phase'],
  })
  sync()

  return () => {
    observer.disconnect()
    delete body.dataset.fatfishScene
  }
}
