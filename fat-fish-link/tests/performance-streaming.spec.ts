// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { installFatFishLinkStatus } from '../src/client/link-status.ts'
import { hasMutationOutsideTranscript } from '../src/client/mutation-filter.ts'

const CSS = readFileSync(resolve(process.cwd(), 'src/client/fat-fish-link.module.css'), 'utf8').replaceAll('\r\n', '\n')
const flush = (): Promise<void> => new Promise(done => { setTimeout(done, 0) })

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
  delete document.body.dataset.fatFishLinkStatus
})

function record(target: Node, added: Node[] = []): MutationRecord {
  return { type: 'childList', target, addedNodes: added as unknown as NodeList, removedNodes: [] as unknown as NodeList } as MutationRecord
}

describe('CHUBBY FISH LINK streaming cost', () => {
  it('lets frame-level controllers skip transcript edits but not the transcript arriving', () => {
    document.body.innerHTML = '<div data-conversation-scroll><div data-chat-flow><p id="tail"></p></div></div>'
    const tail = document.getElementById('tail')!
    const flow = document.querySelector('[data-chat-flow]')!
    expect(hasMutationOutsideTranscript([record(tail, [document.createTextNode('x')])])).toBe(false)
    expect(hasMutationOutsideTranscript([record(flow.parentElement!, [flow])])).toBe(true)
  })

  it('coalesces transcript-only batches in the link signal and resolves the frame at once', async () => {
    document.body.innerHTML = `
      <div data-phase="active"><div data-conversation-scroll>
        <div data-chat-flow><div data-chat-flow-kind="message" id="row"></div></div>
        <div data-composer-seat><div data-composer-input data-phase="idle"></div></div>
      </div></div>`
    const dispose = installFatFishLinkStatus(document.body)
    expect(document.body.dataset.fatFishLinkStatus).toBe('ready')
    vi.useFakeTimers()
    // A streaming row starts running inside the transcript: one trailing pass.
    const running = document.createElement('span')
    running.dataset.state = 'running'
    document.getElementById('row')!.append(running)
    await vi.advanceTimersByTimeAsync(0)
    expect(document.body.dataset.fatFishLinkStatus).toBe('ready')
    await vi.advanceTimersByTimeAsync(130)
    expect(document.body.dataset.fatFishLinkStatus).toBe('working')
    // An approval card lands outside the transcript: no wait.
    const approval = document.createElement('div')
    approval.dataset.approvalKey = 'k'
    document.querySelector('[data-composer-seat]')!.append(approval)
    await vi.advanceTimersByTimeAsync(0)
    expect(document.body.dataset.fatFishLinkStatus).toBe('approval')
    dispose()
  })

  it('pulses the link signal on opacity only', () => {
    const frames = CSS.match(/@keyframes fatfishSignalPulse \{([^@]*?)\n\}/)?.[1] ?? ''
    expect(frames).toContain('opacity')
    expect(frames).not.toContain('box-shadow')
  })
})
