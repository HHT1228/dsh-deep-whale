/** CHUBBY FISH LINK presentation-only client skin. */
import type { Context } from '@deepseek-ai/cordis'
import { installFatFishRelationalMarkers } from './relational-markers.ts'
import { acquireSidebarState } from './sidebar-state.ts'
import {
  FATFISH_LINK_DARK_ACTIVE_ART,
  FATFISH_LINK_DARK_HERO_ART,
  FATFISH_LINK_LIGHT_ACTIVE_ART,
  FATFISH_LINK_LIGHT_HERO_ART,
} from './art.ts'
import { installFatFishComposerCollapse } from './composer-collapse.ts'
import { installFatFishComposerMotion } from './composer-motion.ts'
import { installFatFishCustomization } from './customization.ts'
import { installFatFishHeadlineTypewriter } from './headline-typewriter.ts'
import { installFatFishIcons } from './icons.ts'
import { installFatFishLinkStatus } from './link-status.ts'
import { hasMutationOutsideTranscript } from './mutation-filter.ts'
import { installFatFishPageIcons } from './page-icons.ts'
import { installFatFishPricingLight } from './pricing-light.ts'
import { installFatFishRailSearch } from './rail-search.ts'
import { installFatFishScene } from './scene.ts'
import { installFatFishSettingsOverlay } from './settings-overlay.ts'
import { installFatFishTerminalPerformance } from './terminal-performance.ts'
import { installFatFishWindowResume } from './window-resume.ts'
import { releaseClaimedStyles } from './release-claimed-styles.ts'
import { installFatFishWindowsMenu } from './windows-menu.ts'
import { installFatFishWorkspaceMarks } from './workspace-marks.ts'
import { installFatFishLightVisibility } from './work-light.ts'
import { installFatFishBootError } from './boot-error.ts'
import css from './fat-fish-link.module.css'

const SKIN_TITLE = 'CHUBBY FISH LINK · DSH'
const LIGHT_HERO_ART_PROPERTY = '--fat-fish-link-light-hero-art'
const LIGHT_ACTIVE_ART_PROPERTY = '--fat-fish-link-light-active-art'
const DARK_HERO_ART_PROPERTY = '--fat-fish-link-dark-hero-art'
const DARK_ACTIVE_ART_PROPERTY = '--fat-fish-link-dark-active-art'
const SIDEBAR_WIDTH_PROPERTY = '--fatfish-sidebar-width'
const SIDEBAR_WIDE_ATTRIBUTE = 'data-fatfish-sidebar-wide'
// The settings overlay is a body-level portal, outside the sidebar slot that
// owns the wide state; it reads a body copy that exists only while settings is open.
const SETTINGS_SIDEBAR_WIDE_ATTRIBUTE = 'data-fatfish-settings-sidebar-wide'
const SETTINGS_OPEN_ATTRIBUTE = 'data-fatfish-settings-open'
const SIDEBAR_DRAGGING_ATTRIBUTE = 'data-fatfish-sidebar-dragging'
const APP_FRAME_SELECTOR = "[id='root'] > div[data-slot='root'] > div"
const cls = (name: keyof typeof css): string => css[name] ?? ''

const DSH_WORDMARK = [
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M4 5H44L57 17V28L44 39H4V5ZM16 14V30H40L46 25V20L40 14H16Z" fill="currentColor"/>',
  '<path d="M70 5H119L110 14H80L76 18H108L118 27L106 39H59L68 30H101L105 26H72L62 17L70 5Z" fill="currentColor"/>',
  '<path d="M125 5H137V18H163V5H175V39H163V27H137V39H125V5Z" fill="currentColor"/>',
].join('')

// The logo row is the sidebar root's first child, except on the macOS desktop,
// where the host puts a draggable top strip (system window buttons and the
// sidebar toggle) in front of it.
const SIDEBAR_LOGO_ROW_SELECTOR = "[data-slot='sidebar'] > :first-child > :is([class*='logoRow'], :first-child:not([class*='topStrip']))"

function text(tag: string, className: string, value: string): HTMLElement {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = value
  return element
}

function mountDshWordmark(): boolean {
  const row = document.querySelector(SIDEBAR_LOGO_ROW_SELECTOR)
  if (!(row instanceof HTMLElement)) return false

  const buttons = Array.from(row.querySelectorAll<HTMLButtonElement>(':scope > button'))
  const brand = buttons.find((button, index) => {
    const label = button.getAttribute('aria-label') ?? ''
    return index === 0 && (buttons.length > 1 || !/sidebar|侧边栏/i.test(label))
  })
  if (brand) brand.dataset.fatFishLinkBrand = ''
  const sidebar = row.parentElement!
  if (!sidebar.querySelector(':scope > [data-fat-fish-link-wordmark]')) {
    const wordmark = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    wordmark.classList.add(cls('dshWordmark'))
    wordmark.dataset.fatFishLinkWordmark = ''
    wordmark.dataset.skinChrome = 'wordmark'
    wordmark.setAttribute('viewBox', '0 0 180 44')
    wordmark.setAttribute('aria-hidden', 'true')
    wordmark.innerHTML = DSH_WORDMARK
    sidebar.append(wordmark)
  }
  if (!row.querySelector(':scope > [data-fat-fish-link-signal]')) {
    const chip = document.createElement('span')
    chip.className = cls('signalChip')
    chip.dataset.fatFishLinkSignal = ''
    chip.dataset.skinChrome = 'signal'
    chip.setAttribute('aria-hidden', 'true')
    const dot = document.createElement('span')
    dot.className = cls('signalDot')
    const label = text('span', cls('signalChipLabel'), 'LINK ACTIVE')
    label.dataset.fatFishLinkSignalLabel = ''
    chip.append(dot, label)
    row.append(chip)
  }
  return true
}

// The sidebar slot owns its width and wide state; only the open settings
// portal needs a body copy. Local writes leave the transcript out of the
// inherited custom-property invalidation.
function syncSidebarWidth(body: HTMLElement, pane: Element, dragging: boolean, state: ReturnType<typeof acquireSidebarState>): number {
  // AppFrame writes the transition's final grid tracks to its inline style
  // before animation begins. Prefer that endpoint over ResizeObserver's
  // intermediate pane width so one open/close produces one local style write,
  // not one inherited custom-property invalidation per rendered frame. It is
  // also readable without layout: measuring first forced a synchronous style
  // pass over the whole document before the state writes below, and the writes
  // then cost a second one.
  const frame = body.querySelector<HTMLElement>(APP_FRAME_SELECTOR)
  const firstTrack = frame?.style.gridTemplateColumns.trim().match(/^(-?(?:\d+|\d*\.\d+))px(?:\s|$)/)?.[1]
  const trackWidth = firstTrack === undefined ? Number.NaN : Number.parseFloat(firstTrack)
  let width = trackWidth
  if (!(width > 0)) {
    width = pane.getBoundingClientRect().width
    if (!(width > 0)) return 0
  }
  const serializedWidth = `${width}px`
  // While the handle drags, widths arrive at pointer cadence, so the sidebar's
  // copy waits for the drop (the frame observer flushes it) and the pane-scoped
  // art width and the seam ruler follow the pointer instead.
  if (!dragging) state.setWidth(serializedWidth)
  state.setWide(width > 96)
  return width
}

export function apply(ctx: Context): void {
  const body = document.body
  installFatFishRelationalMarkers(ctx)
  ctx.effect(() => installFatFishCustomization(), 'ui-skin-fat-fish-link: customization declaration')
  // The loader claims untagged <style> tags for whichever plugin loads last and
  // sweeps them when it unloads; hand other plugins' tags back before that.
  ctx.effect(() => () => releaseClaimedStyles(), 'ui-skin-fat-fish-link: release styles claimed by the loader')
  ctx.effect(() => installFatFishLightVisibility(body), 'ui-skin-fat-fish-link: decorative light visibility')
  ctx.effect(() => installFatFishBootError(), 'ui-skin-fat-fish-link: boot failure presentation')
  ctx.effect(() => installFatFishPageIcons(), 'ui-skin-fat-fish-link: page icons')
  ctx.effect(() => installFatFishWindowsMenu(body), 'ui-skin-fat-fish-link: windows caption menubar')
  ctx.effect(() => installFatFishWorkspaceMarks(body), 'ui-skin-fat-fish-link: workspace group tags')
  const originalTitle = document.title
  const originalLightHeroArt = body.style.getPropertyValue(LIGHT_HERO_ART_PROPERTY)
  const originalLightActiveArt = body.style.getPropertyValue(LIGHT_ACTIVE_ART_PROPERTY)
  const originalDarkHeroArt = body.style.getPropertyValue(DARK_HERO_ART_PROPERTY)
  const originalDarkActiveArt = body.style.getPropertyValue(DARK_ACTIVE_ART_PROPERTY)
  const originalSidebarDragging = body.hasAttribute(SIDEBAR_DRAGGING_ATTRIBUTE)
  body.dataset.dshFatFishLink = ''
  body.style.setProperty(LIGHT_HERO_ART_PROPERTY, `url("${FATFISH_LINK_LIGHT_HERO_ART}")`)
  body.style.setProperty(LIGHT_ACTIVE_ART_PROPERTY, `url("${FATFISH_LINK_LIGHT_ACTIVE_ART}")`)
  body.style.setProperty(DARK_HERO_ART_PROPERTY, `url("${FATFISH_LINK_DARK_HERO_ART}")`)
  body.style.setProperty(DARK_ACTIVE_ART_PROPERTY, `url("${FATFISH_LINK_DARK_ACTIVE_ART}")`)
  const disposeScene = installFatFishScene(body)
  const disposeComposerMotion = installFatFishComposerMotion(body)
  const disposeComposerCollapse = installFatFishComposerCollapse(body)
  const disposeHeadlineTypewriter = installFatFishHeadlineTypewriter(body)
  const disposeIcons = installFatFishIcons(body)
  const disposeRailSearch = installFatFishRailSearch(body)
  const disposeWindowResume = installFatFishWindowResume(body)
  const disposeTerminalPerformance = installFatFishTerminalPerformance(body)
  const disposeSettingsOverlay = installFatFishSettingsOverlay(body)

  let wordmarkRow: Element | null = null
  const wordmarkObserver = new MutationObserver((records) => {
    if (!hasMutationOutsideTranscript(records)) return
    // Conversation updates cannot replace chrome inside a connected logo row.
    if (wordmarkRow?.isConnected && !records.some(record => wordmarkRow!.contains(record.target))) return
    mountDshWordmark()
    wordmarkRow = document.querySelector(SIDEBAR_LOGO_ROW_SELECTOR)
  })
  mountDshWordmark()
  wordmarkRow = document.querySelector(SIDEBAR_LOGO_ROW_SELECTOR)
  const disposeLinkStatus = installFatFishLinkStatus(body)
  const disposePricingLight = installFatFishPricingLight(body, {
    light: cls('pricingLight'),
    housing: cls('pricingHousing'),
    lamp: cls('pricingLamp'),
    lampRed: cls('pricingLampRed'),
    lampAmber: cls('pricingLampAmber'),
    lampGreen: cls('pricingLampGreen'),
    label: cls('pricingLabel'),
    tooltip: cls('pricingTooltip'),
    tooltipTitle: cls('pricingTooltipTitle'),
    tooltipRow: cls('pricingTooltipRow'),
    tooltipKey: cls('pricingTooltipKey'),
    tooltipValue: cls('pricingTooltipValue'),
  })
  wordmarkObserver.observe(body, { childList: true, subtree: true })

  const spine = document.createElement('div')
  spine.className = cls('spine')
  spine.dataset.skinChrome = 'spine'
  spine.setAttribute('aria-hidden', 'true')

  let observedSidebar: Element | null = null
  let observedFrame: Element | null = null
  let lastSidebarWidth = 0
  let sidebarState: ReturnType<typeof acquireSidebarState> | undefined
  const settingsState = acquireSidebarState(body, SETTINGS_SIDEBAR_WIDE_ATTRIBUTE)
  ctx.effect(() => () => {
    sidebarState?.release()
    settingsState.release()
  }, 'ui-skin-fat-fish-link: sidebar state ownership')
  const syncSettingsSidebarState = (): void => {
    // The settings portal needs a body copy only while it is open.
    const open = body.hasAttribute(SETTINGS_OPEN_ATTRIBUTE) && lastSidebarWidth > 0
    if (open) {
      settingsState.setWidth(`${lastSidebarWidth}px`)
      settingsState.setWide(lastSidebarWidth > 96)
    } else {
      settingsState.restore()
    }
  }

  const settingsOpenObserver = new MutationObserver(syncSettingsSidebarState)
  const syncObservedSidebar = (pane: Element): void => {
    const dragging = body.hasAttribute(SIDEBAR_DRAGGING_ATTRIBUTE)
    const width = syncSidebarWidth(body, pane, dragging, sidebarState!)
    if (width > 0 && width !== lastSidebarWidth) {
      lastSidebarWidth = width
      syncSettingsSidebarState()
      // The seam ruler is a body child, so it carries its own copy.
      if (!dragging) spine.style.setProperty(SIDEBAR_WIDTH_PROPERTY, `${width}px`)
    }
    if (width <= 96) return
    if (dragging) spine.style.transform = `translateX(${width - 4}px)`
  }
  const frameObserver = new MutationObserver(() => {
    const dragging = observedFrame?.hasAttribute('data-dragging') === true
    if (body.hasAttribute(SIDEBAR_DRAGGING_ATTRIBUTE) === dragging) {
      // The track or the collapse flag moved: commit the width state here, in
      // the same task as the host's own attribute writes, so the frame's first
      // style pass sees both. From the ResizeObserver (after layout) it cost a
      // second full-document pass per toggle.
      if (observedSidebar) syncObservedSidebar(observedSidebar)
      return
    }
    body.toggleAttribute(SIDEBAR_DRAGGING_ATTRIBUTE, dragging)
    if (dragging) return
    // Drop: hand the seam back to the stylesheet and commit the final width.
    spine.style.removeProperty('transform')
    if (lastSidebarWidth > 0) spine.style.setProperty(SIDEBAR_WIDTH_PROPERTY, `${lastSidebarWidth}px`)
    if (observedSidebar) syncObservedSidebar(observedSidebar)
  })
  const sidebarResizeObserver = typeof ResizeObserver === 'undefined'
    ? undefined
    : new ResizeObserver(() => {
        if (observedSidebar) syncObservedSidebar(observedSidebar)
      })
  const mountSidebarObserver = (): boolean => {
    const pane = document.querySelector("[data-slot='sidebar'] > :first-child")
    if (!pane) return false
    if (pane !== observedSidebar) {
      sidebarResizeObserver?.disconnect()
      sidebarState?.release()
      observedSidebar = pane
      sidebarState = acquireSidebarState(pane.parentElement!, SIDEBAR_WIDE_ATTRIBUTE)
      sidebarResizeObserver?.observe(pane)
    }
    const frame = body.querySelector(APP_FRAME_SELECTOR)
    if (frame !== observedFrame) {
      frameObserver.disconnect()
      observedFrame = frame
      if (frame) frameObserver.observe(frame, { attributes: true, attributeFilter: ['data-dragging', 'data-sidebar-collapsed', 'style'] })
    }
    syncObservedSidebar(pane)
    return true
  }
  const sidebarMountObserver = new MutationObserver(() => {
    if (mountSidebarObserver()) sidebarMountObserver.disconnect()
  })
  ctx.effect(() => () => {
    settingsOpenObserver.disconnect()
    sidebarMountObserver.disconnect()
    sidebarResizeObserver?.disconnect()
    frameObserver.disconnect()
  }, 'ui-skin-fat-fish-link: sidebar observers')
  settingsOpenObserver.observe(body, { attributes: true, attributeFilter: [SETTINGS_OPEN_ATTRIBUTE] })
  if (!mountSidebarObserver()) sidebarMountObserver.observe(body, { childList: true, subtree: true })

  const lightScene = document.createElement('div')
  lightScene.className = cls('lightScene')
  lightScene.dataset.skinChrome = 'light-scene'
  lightScene.setAttribute('aria-hidden', 'true')
  const lightHeroScene = document.createElement('div')
  lightHeroScene.className = `${cls('lightSceneLayer')} ${cls('lightSceneHero')}`
  const lightActiveScene = document.createElement('div')
  lightActiveScene.className = `${cls('lightSceneLayer')} ${cls('lightSceneActive')}`
  lightScene.append(lightHeroScene, lightActiveScene)

  const darkScene = document.createElement('div')
  darkScene.className = cls('darkScene')
  darkScene.dataset.skinChrome = 'dark-scene'
  darkScene.setAttribute('aria-hidden', 'true')
  const darkHeroScene = document.createElement('div')
  darkHeroScene.className = `${cls('darkSceneLayer')} ${cls('darkSceneHero')}`
  const darkActiveScene = document.createElement('div')
  darkActiveScene.className = `${cls('darkSceneLayer')} ${cls('darkSceneActive')}`
  darkScene.append(darkHeroScene, darkActiveScene)

  const standby = document.createElement('div')
  standby.className = cls('standby')
  standby.dataset.skinChrome = 'standby'
  standby.setAttribute('aria-hidden', 'true')
  standby.append(text('span', cls('standbyLine'), ''))
  standby.append(text('span', cls('standbyCopy'), 'CHUBBY FISH LINK STANDBY'))
  standby.append(text('span', cls('standbyLine'), ''))

  document.title = SKIN_TITLE
  body.append(lightScene, darkScene, spine, standby)

  ctx.effect(() => () => {
    disposeScene()
    disposeLinkStatus()
    disposePricingLight()
    disposeHeadlineTypewriter()
    disposeComposerCollapse()
    disposeComposerMotion()
    disposeIcons()
    disposeRailSearch()
    disposeWindowResume()
    disposeTerminalPerformance()
    disposeSettingsOverlay()
    delete body.dataset.dshFatFishLink
    if (originalLightHeroArt === '') body.style.removeProperty(LIGHT_HERO_ART_PROPERTY)
    else body.style.setProperty(LIGHT_HERO_ART_PROPERTY, originalLightHeroArt)
    if (originalLightActiveArt === '') body.style.removeProperty(LIGHT_ACTIVE_ART_PROPERTY)
    else body.style.setProperty(LIGHT_ACTIVE_ART_PROPERTY, originalLightActiveArt)
    if (originalDarkHeroArt === '') body.style.removeProperty(DARK_HERO_ART_PROPERTY)
    else body.style.setProperty(DARK_HERO_ART_PROPERTY, originalDarkHeroArt)
    if (originalDarkActiveArt === '') body.style.removeProperty(DARK_ACTIVE_ART_PROPERTY)
    else body.style.setProperty(DARK_ACTIVE_ART_PROPERTY, originalDarkActiveArt)
    body.toggleAttribute(SIDEBAR_DRAGGING_ATTRIBUTE, originalSidebarDragging)
    lightScene.remove()
    darkScene.remove()
    spine.remove()
    standby.remove()
    wordmarkObserver.disconnect()
    document.querySelectorAll('[data-fat-fish-link-wordmark]').forEach((wordmark) => wordmark.remove())
    document.querySelectorAll('[data-fat-fish-link-signal]').forEach((chip) => chip.remove())
    document.querySelectorAll('[data-fat-fish-link-brand]').forEach((brandButton) => {
      brandButton.removeAttribute('data-fat-fish-link-brand')
    })
    if (document.title === SKIN_TITLE) document.title = originalTitle
  }, 'ui-skin-fat-fish-link: technical chrome')
}
