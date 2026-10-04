/** Resolve against the host base, including reverse-proxy mounts and dsh-app desktop forwarding. */
export function skinAssetUrl(file: string): string {
  return new URL(`skin-assets/fat-fish-link/${file}`, document.baseURI).href
}
