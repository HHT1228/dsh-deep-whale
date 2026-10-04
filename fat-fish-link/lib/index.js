import { readFile } from "node:fs/promises";
//#region ../shared/skin-assets.ts
/** Public, immutable artwork only. Paths come from the shipped allowlist, never from disk traversal. */
function installSkinAssets(ctx, id, directory, files) {
	const prefix = `/skin-assets/${id}`;
	const allowed = new Set(files);
	ctx.inject(["webServer"], (webCtx) => {
		const server = webCtx.get("webServer");
		webCtx.effect(() => server.register({
			kind: "prefix",
			path: prefix,
			handler: async (req, res) => {
				if (req.method !== "GET" && req.method !== "HEAD") {
					res.writeHead(405, { Allow: "GET, HEAD" }).end();
					return;
				}
				const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
				const file = pathname.slice(prefix.length + 1);
				if (!pathname.startsWith(`${prefix}/`) || !allowed.has(file) || !/^[a-f0-9]{64}\.(png|webp)$/.test(file)) {
					res.writeHead(404).end();
					return;
				}
				let bytes;
				try {
					bytes = await readFile(new URL(file, directory));
				} catch (error) {
					if (error.code !== "ENOENT") throw error;
					res.writeHead(404).end();
					return;
				}
				const etag = `"${file.split(".")[0]}"`;
				const headers = {
					"Content-Type": file.endsWith(".webp") ? "image/webp" : "image/png",
					"Cache-Control": "public, max-age=31536000, immutable",
					"X-Content-Type-Options": "nosniff",
					ETag: etag
				};
				if (req.headers["if-none-match"]?.split(",").some((value) => value.trim().replace(/^W\//, "") === etag || value.trim() === "*")) {
					res.writeHead(304, headers).end();
					return;
				}
				res.writeHead(200, {
					...headers,
					"Content-Length": bytes.length
				});
				res.end(req.method === "HEAD" ? void 0 : bytes);
			}
		}), `${id}: packaged artwork`);
	});
}
//#endregion
//#region assets/runtime/manifest.json
var manifest_default = [
	"06b4f9ef930386c38d4daa2c264d600bec188f58199b5b34002ecb30c7cd1962.png",
	"11b818199cf65437211826c6434ac7b49f2bfcff1814be79c0ee9f77e1dc62d6.webp",
	"15ad678f5c394f68c93a1e575c77488ea290a9780e0162b9640c607477b46c8d.webp",
	"1d63b2ee2d7e70678527d58d65ae382d41b2af878886e97f86002c57e313e416.png",
	"337485ea92356567a66119270acd9496976fa75d933b83f6a7264fa136b7e3cb.webp",
	"9527647570513378137c59775582e9c26ffe15c128b76886fcd21bfddb6f60a2.webp",
	"df841aa4f4621d3cc6ae2e2fabe8c5187963da614480f25b0b7bcea8be5bfd5c.webp"
];
//#endregion
//#region src/index.ts
/** Serve only this package's immutable presentation assets while the skin is enabled. */
function apply(ctx) {
	installSkinAssets(ctx, "fat-fish-link", new URL("../assets/runtime/", import.meta.url), manifest_default);
}
//#endregion
export { apply };
