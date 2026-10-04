import { skinAssetUrl } from './asset-url.ts'

/**
 * The four 16:9 scene layers this skin ships: one room per theme, each with an
 * idle frame and a working frame that cross-fade while a task runs. The files
 * live in `assets/runtime/` under their content hash and are served by this
 * package's node half; see `docs/asset-delivery.md` for how to replace one.
 */

export const FATFISH_LINK_LIGHT_HERO_ART = skinAssetUrl('11b818199cf65437211826c6434ac7b49f2bfcff1814be79c0ee9f77e1dc62d6.webp')
export const FATFISH_LINK_LIGHT_ACTIVE_ART = skinAssetUrl('15ad678f5c394f68c93a1e575c77488ea290a9780e0162b9640c607477b46c8d.webp')

export const FATFISH_LINK_DARK_HERO_ART = skinAssetUrl('337485ea92356567a66119270acd9496976fa75d933b83f6a7264fa136b7e3cb.webp')
export const FATFISH_LINK_DARK_ACTIVE_ART = skinAssetUrl('df841aa4f4621d3cc6ae2e2fabe8c5187963da614480f25b0b7bcea8be5bfd5c.webp')
