// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import {
  SKIN_CUSTOMIZATION_REGISTER_EVENT,
  type SkinCustomizationDefinition,
  type SkinCustomizationRegistration,
} from '../../skin-manager/src/protocol.ts'
import { installFatFishCustomization } from '../src/client/customization.ts'

/** The eight settings this skin declares, in declaration order. */
const SETTING_KEYS = [
  'background',
  'pricingLight',
  'centerSettings',
  'scrollHideComposer',
  'composerBottomOnly',
  'composerHandles',
  'headlineTypewriter',
  'sfwMode',
]

/** The document attributes those settings project onto <html>. */
const PROJECTED_ATTRIBUTES = [
  'data-dsh-whale-fatfish-background',
  'data-dsh-whale-fatfish-pricing',
  'data-dsh-whale-fatfish-art',
  'data-dsh-whale-fatfish-settings-layout',
  'data-dsh-whale-fatfish-composer-scroll-hide',
  'data-dsh-whale-fatfish-composer-bottom-only',
  'data-dsh-whale-fatfish-composer-handles',
  'data-dsh-whale-fatfish-headline-typewriter',
]

function register(): { definition: SkinCustomizationDefinition; dispose: () => void } {
  let registration: SkinCustomizationRegistration | undefined
  const receive = (event: Event) => { registration = (event as CustomEvent<SkinCustomizationRegistration>).detail }
  window.addEventListener(SKIN_CUSTOMIZATION_REGISTER_EVENT, receive)
  const dispose = installFatFishCustomization()
  return {
    definition: registration!.definition,
    dispose: () => {
      dispose()
      window.removeEventListener(SKIN_CUSTOMIZATION_REGISTER_EVENT, receive)
    },
  }
}

afterEach(() => {
  for (const attribute of [...document.documentElement.attributes]) {
    if (attribute.name.startsWith('data-dsh-whale-')) document.documentElement.removeAttribute(attribute.name)
  }
})

describe('CHUBBY FISH LINK customization declaration', () => {
  it('declares exactly the eight shipped switches and normalises absent values', () => {
    const { definition, dispose } = register()
    expect(definition.settings.map(setting => setting.key)).toEqual(SETTING_KEYS)

    // An absent value must read as the declared default: on for the switches
    // that default on, off for `composerBottomOnly`, and the visibility
    // schedule's verdict while it has not run yet.
    definition.apply({ values: {}, visibility: {} })
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-background')).toBe('hidden')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-pricing')).toBe('hidden')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-art')).toBe('visible')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-settings-layout')).toBe('docked')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-composer-scroll-hide')).toBe('on')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-composer-bottom-only')).toBe('off')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-composer-handles')).toBe('on')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-headline-typewriter')).toBe('on')
    dispose()
  })

  it('projects every declared switch and releases them on disposal', () => {
    const { definition, dispose } = register()
    definition.apply({
      values: {
        background: true,
        pricingLight: false,
        centerSettings: true,
        scrollHideComposer: false,
        composerBottomOnly: true,
        composerHandles: true,
        headlineTypewriter: false,
        sfwMode: { enabled: true, outside: 'visible', ranges: [] },
      },
      visibility: { sfwMode: false },
    })
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-background')).toBe('visible')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-pricing')).toBe('hidden')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-art')).toBe('hidden')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-settings-layout')).toBe('centered')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-composer-scroll-hide')).toBe('off')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-composer-bottom-only')).toBe('on')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-composer-handles')).toBe('on')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-headline-typewriter')).toBe('off')
    dispose()
    for (const attribute of PROJECTED_ATTRIBUTES) {
      expect(document.documentElement.hasAttribute(attribute), attribute).toBe(false)
    }
  })

  it('retires the scene art with the SFW window and leaves the background switch alone', () => {
    const { definition, dispose } = register()
    const values = {
      background: true,
      pricingLight: true,
      centerSettings: false,
      sfwMode: { enabled: true, outside: 'visible', ranges: [] },
    }

    // SFW hidden window: the schedule retires the art on its own.
    definition.apply({ values, visibility: { sfwMode: false } })
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-art')).toBe('hidden')
    // The schedule only drives the illustration layers; the background switch
    // keeps its own verdict in both windows.
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-background')).toBe('visible')

    // SFW visible window: the art returns.
    definition.apply({ values, visibility: { sfwMode: true } })
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-art')).toBe('visible')
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-background')).toBe('visible')

    // A switched-off background stays off even inside the SFW window.
    definition.apply({ values: { ...values, background: false }, visibility: { sfwMode: false } })
    expect(document.documentElement.getAttribute('data-dsh-whale-fatfish-background')).toBe('hidden')
    dispose()
  })

  it('releases every projected attribute when the manager withdraws its state', () => {
    const { definition, dispose } = register()
    definition.apply({
      values: { background: true, pricingLight: true, centerSettings: true, composerBottomOnly: true },
      visibility: { sfwMode: true },
    })
    for (const attribute of PROJECTED_ATTRIBUTES) {
      expect(document.documentElement.hasAttribute(attribute), attribute).toBe(true)
    }

    definition.apply(null)
    for (const attribute of PROJECTED_ATTRIBUTES) {
      expect(document.documentElement.hasAttribute(attribute), attribute).toBe(false)
    }
    dispose()
  })

  it('declares English copy for the manager surface', () => {
    const { definition, dispose } = register()
    // The title is already language-neutral; every label and description
    // carries an explicit En variant for the manager's fallback path.
    expect(definition.title).toBe('CHUBBY FISH LINK')
    for (const setting of definition.settings) {
      expect(setting.labelEn, `${setting.key} labelEn`).toBeTypeOf('string')
      if (setting.description !== undefined) expect(setting.descriptionEn, `${setting.key} descriptionEn`).toBeTypeOf('string')
    }
    dispose()
  })
})
