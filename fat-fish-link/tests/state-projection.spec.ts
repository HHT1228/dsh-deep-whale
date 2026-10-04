// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { installFatFishSettingsOverlay } from '../src/client/settings-overlay.ts'
import { installFatFishWorkspaceMarks } from '../src/client/workspace-marks.ts'

const flush = async (): Promise<void> => { await Promise.resolve(); await Promise.resolve() }

describe('CHUBBY FISH relational state projected as attributes (no :has() probes)', () => {
  afterEach(() => { document.body.innerHTML = ''; for (const a of [...document.body.attributes]) document.body.removeAttribute(a.name) })

  it('projects the keyed panel page from the main outlet', async () => {
    document.body.innerHTML = `
      <div data-slot="main" style="display: contents">
        <div data-slot="main.conversation" style="display: contents"><main data-phase="hero"></main></div>
      </div>
    `
    const dispose = installFatFishSettingsOverlay(document.body)
    const main = document.querySelector<HTMLElement>("[data-slot='main']")!
    expect(document.body.hasAttribute('data-fatfish-panel-page')).toBe(false)

    main.innerHTML = '<section data-plugin-panel></section>'
    await flush()
    expect(document.body.hasAttribute('data-fatfish-panel-page')).toBe(true)

    main.innerHTML = '<div data-slot="main.conversation" style="display: contents"><main data-phase="active"></main></div>'
    await flush()
    expect(document.body.hasAttribute('data-fatfish-panel-page')).toBe(false)

    main.innerHTML = '<section data-plugin-panel></section>'
    await flush()
    dispose()
    expect(document.body.hasAttribute('data-fatfish-panel-page')).toBe(false)
  })

  it('tags only the settings portal mask, and removes the tag with the dialog and on dispose', async () => {
    const dispose = installFatFishSettingsOverlay(document.body)
    const mask = document.createElement('div')
    mask.setAttribute('role', 'presentation')
    mask.innerHTML = '<div role="dialog" aria-modal="true" data-shortcut-modal="settings"></div>'
    const unrelated = document.createElement('div')
    unrelated.setAttribute('role', 'presentation')
    unrelated.innerHTML = '<div role="dialog" aria-modal="true" data-shortcut-modal="shortcuts"></div>'
    document.body.append(mask, unrelated)
    await flush()
    expect(mask.hasAttribute('data-fatfish-settings-overlay')).toBe(true)
    expect(unrelated.hasAttribute('data-fatfish-settings-overlay')).toBe(false)

    mask.remove()
    await flush()
    expect(document.querySelector('[data-fatfish-settings-overlay]')).toBeNull()

    document.body.append(mask)
    await flush()
    expect(mask.hasAttribute('data-fatfish-settings-overlay')).toBe(true)
    dispose()
    expect(mask.hasAttribute('data-fatfish-settings-overlay')).toBe(false)
  })

  it('tags the sidebar root and its children that hold a tooltip, dialog or cordis panel', async () => {
    document.body.innerHTML = `
      <div data-slot="sidebar" style="display: contents">
        <div class="root">
          <div class="logoRow"></div>
          <div class="foot"></div>
          <div class="other"></div>
        </div>
      </div>
    `
    const dispose = installFatFishSettingsOverlay(document.body)
    const root = document.querySelector<HTMLElement>('.root')!
    const logoRow = document.querySelector<HTMLElement>('.logoRow')!
    const foot = document.querySelector<HTMLElement>('.foot')!
    const other = document.querySelector<HTMLElement>('.other')!
    expect(document.querySelector('[data-fatfish-tooltip-carrier], [data-fatfish-tooltip-root], [data-fatfish-dialog-carrier], [data-fatfish-cordis-carrier]')).toBeNull()

    const tip = document.createElement('div')
    tip.setAttribute('role', 'tooltip')
    logoRow.append(tip)
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    foot.append(dialog)
    const cordis = document.createElement('div')
    cordis.setAttribute('data-cordis-panel', '')
    other.append(cordis)
    await flush()

    expect(root.hasAttribute('data-fatfish-tooltip-root')).toBe(true)
    expect(logoRow.hasAttribute('data-fatfish-tooltip-carrier')).toBe(true)
    expect(foot.hasAttribute('data-fatfish-tooltip-carrier')).toBe(false)
    expect(foot.hasAttribute('data-fatfish-dialog-carrier')).toBe(true)
    expect(other.hasAttribute('data-fatfish-cordis-carrier')).toBe(true)

    tip.remove()
    dialog.remove()
    await flush()
    expect(root.hasAttribute('data-fatfish-tooltip-root')).toBe(false)
    expect(logoRow.hasAttribute('data-fatfish-tooltip-carrier')).toBe(false)
    expect(foot.hasAttribute('data-fatfish-dialog-carrier')).toBe(false)

    logoRow.append(tip)
    await flush()
    dispose()
    expect(document.querySelector('[data-fatfish-tooltip-carrier], [data-fatfish-tooltip-root], [data-fatfish-dialog-carrier], [data-fatfish-cordis-carrier]')).toBeNull()
  })

  it('tags workspace groups by what they hold instead of a :has() probe on every tree row', async () => {
    document.body.innerHTML = `
      <div data-slot="sidebar">
        <div role="tree">
          <div class="g1"><div role="treeitem" aria-expanded="true"></div><div role="treeitem" aria-selected="false"></div></div>
          <div class="g2"><div role="treeitem" aria-expanded="false"></div><div role="treeitem" aria-selected="true"></div></div>
          <div class="g3"><span></span></div>
        </div>
      </div>
    `
    const dispose = installFatFishWorkspaceMarks(document.body)
    const [g1, g2, g3] = ['.g1', '.g2', '.g3'].map(s => document.querySelector<HTMLElement>(s)!)
    expect(g1.hasAttribute('data-fatfish-workspace-group')).toBe(true)
    expect(g1.hasAttribute('data-fatfish-workspace-selectable')).toBe(true)
    expect(g1.hasAttribute('data-fatfish-workspace-current')).toBe(false)
    expect(g2.hasAttribute('data-fatfish-workspace-current')).toBe(true)
    expect([...g3.attributes].some(a => a.name.startsWith('data-fatfish-workspace'))).toBe(false)

    // Selecting a session in the first group moves the current mark.
    g2.querySelector('[aria-selected]')!.setAttribute('aria-selected', 'false')
    g1.querySelector('[aria-selected]')!.setAttribute('aria-selected', 'true')
    await flush()
    expect(g1.hasAttribute('data-fatfish-workspace-current')).toBe(true)
    expect(g2.hasAttribute('data-fatfish-workspace-current')).toBe(false)

    dispose()
    expect(document.querySelector('[data-fatfish-workspace-group], [data-fatfish-workspace-selectable], [data-fatfish-workspace-current]')).toBeNull()
  })
})
