import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  new URL('../src/client/fat-fish-link.module.css', import.meta.url),
  'utf8',
).replaceAll('\r\n', '\n')

describe('CHUBBY FISH LINK sidebar motion', () => {
  it('moves the wordmark in a stable sidebar coordinate system', () => {
    const rule = css.match(/body\[data-dsh-fat-fish-link\] \.dshWordmark\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rule).toContain('top: calc(21px + var(--fatfish-stage-top, 0px));')
    expect(rule).toContain('left: 0;')
    expect(rule).toContain('transform-origin: center;')
    expect(rule).not.toMatch(/(?:top|left) 260ms/)
  })

  it('centers the collapsed wordmark using the final sidebar track width', () => {
    expect(css).toContain('translateX(calc((var(--fatfish-sidebar-width, 56px) - 118px) / 2)) scale(0.28)')
    expect(css).toContain('transform: translateX(16px) scale(1);')
  })

  it('runs every track-coupled layer on the host sidebar clock', () => {
    expect(css).toContain('--fatfish-track-duration: var(--ds-transition-duration-slow, 300ms);')
    expect(css).toContain('--fatfish-track-ease: var(--ds-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));')
    expect(css).toContain('transform var(--fatfish-track-duration) var(--fatfish-track-ease)')
    expect(css).not.toContain('transition-duration: 200ms;')
  })

  it('moves the seam ruler by transform on the track clock and stops easing during a drag', () => {
    const spine = css.match(/.spine {([^}]*)}/s)?.[1] ?? ''
    expect(spine).toContain('left: 0;')
    expect(spine).toContain('transform: translateX(calc(var(--fatfish-sidebar-width) - 4px));')
    expect(spine).toContain('transition: transform var(--fatfish-track-duration) var(--fatfish-track-ease);')
    expect(css).toContain('body[data-dsh-fat-fish-link][data-fatfish-sidebar-dragging] .spine { transition: none; }')
  })

  it('hides stale sidebar tooltips during WebApp window resume', () => {
    expect(css).toContain("[data-fatfish-window-resuming] [data-slot='sidebar'] [role='tooltip']")
    expect(css).toContain('display: none;')
  })

  // Issue #116: a plugin may inject a portalled host plus its own button instead
  // of a direct-child button. The host must be lifted out of the stage, and the
  // region margin reset must fire for it in both marker shapes.
  it('treats a portalled plugin entry host as a sidebar entry', () => {
    const lifted = css.match(
      /body\[data-dsh-fat-fish-link\] \[data-slot='sidebar'\]\[data-fatfish-sidebar-wide\]\s*>\s*:first-child\s*>\s*:is\((?<selector>[^{]*)\)\s*\{/,
    )?.groups?.selector ?? ''
    expect(lifted).toContain("button[data-dsh-part='sidebar-entry']")
    expect(lifted).toContain('[data-plugin-entry]')
    expect(css).toContain('> :first-child[data-fatfish-sidebar-entries]')
    expect(css).toContain('> :not([role=\'tooltip\'], [data-fat-fish-link-wordmark], [data-plugin-entry])')
    // The narrow-viewport block retires the stage, so the entry offset must
    // retire with it for both marker shapes.
    const narrow = css.match(
      /@media \(max-width: 900px\) \{[\s\S]*?\n\}/,
    )?.[0] ?? ''
    expect(narrow).not.toBe('')
    expect(narrow).toMatch(/:is\(button\[data-dsh-part='sidebar-entry'\], \[data-plugin-entry\], nav\[class\*='panelList'\]\)/)
  })

  // 0.1.6 registers the first `sidebar.panellist` entry, so the official
  // `nav.panelList` row renders between New Session and the browsing region for
  // the first time. Left alone it landed on the stage, which both misplaced the
  // row and swallowed its clicks; the injected-entry offsets also inherit a flow
  // anchor one row lower.
  it('restores the web logo-row flow under the Windows caption frame', () => {
    const root = "html[data-windows-titlebar] body[data-dsh-fat-fish-link]\n    [data-slot='sidebar'] > [class*='root']:not([class*='collapsed'])"
    expect(css).toContain(`${root} > [class*='logoRow'] {\n  height: 60px;\n  margin-bottom: 4px;\n}`)
    expect(css).toContain(`${root} > button[class*='newSession'] {\n  margin-top: 0;\n}`)
  })

  it('offsets the absolute stage placements below the macOS window-button strip', () => {
    expect(css).toContain("html[data-platform='darwin'] body[data-dsh-fat-fish-link] {\n  --fatfish-stage-top: 34px;\n}")
    // The scan line re-anchors to the strip, which is the root's first child there.
    expect(css).toContain('top: calc(21px + var(--fatfish-stage-top));')
    // The wide pricing light rides the same offset.
    expect(css).toContain('top: calc(46px + var(--fatfish-stage-top, 0px));')
    expect(css).toContain("[class*='logoRow'] > [class*='brand'] {\n  visibility: hidden;\n}")
  })

  it('lifts the official panel row out of the stage', () => {
    const lifted = css.match(
      /body\[data-dsh-fat-fish-link\] \[data-slot='sidebar'\]\[data-fatfish-sidebar-wide\]\s*>\s*:first-child\s*>\s*:is\((?<selector>[^{]*)\)\s*\{/,
    )?.groups?.selector ?? ''
    expect(lifted).toContain("nav[class*='panelList']")
    // The declaration block that follows the first `nav[class*=…]` selector.
    const fromSelector = css.slice(css.indexOf("nav[class*='panelList']"))
    const declarations = fromSelector.slice(fromSelector.indexOf('{') + 1, fromSelector.indexOf('}'))
    expect(declarations).toContain('z-index: 3;')
    // A row following the official one must not pay the stage offset twice.
    expect(css).toContain(
      "> nav[class*='panelList']\n  ~ :is(button[data-dsh-part='sidebar-entry'], [data-plugin-entry]) {",
    )
  })

})
