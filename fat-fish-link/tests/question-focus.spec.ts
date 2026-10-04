import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  new URL('../src/client/fat-fish-link.module.css', import.meta.url),
  'utf8',
).replaceAll('\r\n', '\n')

describe('question composer focus styling', () => {
  it('keeps the global accessibility outline while exempting question inputs', () => {
    expect(css).toContain("body[data-dsh-fat-fish-link] :focus-visible:not(")
    expect(css).toContain('outline: 2px solid var(--fatfish-blue)')
    expect(css).toContain("[data-question-key] :is(input, textarea):focus-visible {\n  outline: none;")
  })

  it('moves question focus to a muted rectilinear row indicator', () => {
    expect(css).toContain("[data-question-key] :has(> input:focus)")
    expect(css).toContain('border-color: var(--fatfish-question-focus)')
    expect(css).toContain('inset 3px 0 0 var(--fatfish-question-focus)')
    expect(css).toContain('--fatfish-question-focus: #12508f')
  })

  it('keeps the focus bar off the zero-padding inline answer field', () => {
    // The bar belongs on the row/block chrome; on the textarea itself it would
    // cover the first glyph of an inline answer.
    expect(css).toContain("[data-question-key] :is([class*='_customRow'], [class*='_customBlock']):focus-within")
    const from = css.indexOf('[data-question-key] textarea:focus')
    const textareaRule = css.slice(from, css.indexOf('}', from))
    expect(textareaRule).not.toContain('inset 3px')
    expect(textareaRule).toContain('caret-color: var(--fatfish-question-focus)')
  })

  it('keeps question recommendation text readable in dark mode', () => {
    expect(css).toContain('--dsw-alias-button-info-fill: #4d91ff !important;')
  })
})
