// Builds the display copies of every file the content references.
//   content/media/<file>  (originals, uploaded through the CMS)
//   → public/media/<file> (JPG/PNG/WebP ≤1200px wide; GIF and PDF copied as-is)
// and records image sizes in src/data/image-sizes.json for layout.
// Runs before `next dev` / `next build`; unchanged files are skipped.
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA = path.join(ROOT, "content", "media");
const OUT = path.join(ROOT, "public", "media");
const SIZES = path.join(ROOT, "src", "data", "image-sizes.json");
const MAX_WIDTH = 1200;

const readJson = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const base = (p) => p.split("/").pop();
// Keep each file in its own format so the extension stays truthful.
const format = (n) => (/\.png$/i.test(n) ? "png" : /\.webp$/i.test(n) ? "webp" : "jpeg");

const { works } = await readJson("src/data/works.generated.json"); // from build-content.mjs
const profile = await readJson("content/profile.json");
const files = new Set(works.flatMap((w) => [w.thumb, ...w.images]).filter(Boolean).map(base));
if (profile.resume) files.add(base(profile.resume));

const mtime = async (f) => (await stat(f).catch(() => null))?.mtimeMs ?? 0;
const prev = JSON.parse(await readFile(SIZES, "utf8").catch(() => "{}"));
const sizes = {};
let built = 0;

await mkdir(OUT, { recursive: true });
for (const name of [...files].sort()) {
	const src = path.join(MEDIA, name);
	const dst = path.join(OUT, name);
	if (!(await mtime(src))) throw new Error(`content/media/${name} is referenced but missing`);
	const fresh = (await mtime(dst)) >= (await mtime(src));

	if (/\.(gif|pdf)$/i.test(name)) {
		if (!fresh) {
			await copyFile(src, dst);
			built++;
		}
	} else if (!fresh || !prev[name]) {
		await sharp(src, { limitInputPixels: false })
			.rotate()
			.resize({ width: MAX_WIDTH, withoutEnlargement: true })
			.toFormat(format(name), { quality: 80, progressive: true, mozjpeg: true })
			.toFile(dst);
		built++;
	}
	if (!/\.pdf$/i.test(name)) {
		const m = fresh && prev[name] ? null : await sharp(dst).metadata();
		sizes[name] = m ? [m.width, m.pageHeight ?? m.height] : prev[name];
	}
}

// Small WebP copies of the thumbnails for the main-page prototypes (/lab): ~7 KB each
// instead of the 1200px copy (GIFs keep only their first frame).
const SMALL = path.join(OUT, "s");
await mkdir(SMALL, { recursive: true });
let small = 0;
for (const name of new Set(works.map((w) => base(w.thumb)))) {
	const src = path.join(MEDIA, name);
	const dst = path.join(SMALL, `${name.replace(/\.[^.]+$/, "")}.webp`);
	if ((await mtime(dst)) >= (await mtime(src))) continue;
	await sharp(src, { limitInputPixels: false, animated: false })
		.rotate()
		.resize({ width: 256, withoutEnlargement: true })
		.webp({ quality: 75 })
		.toFile(dst);
	small++;
}

await writeFile(SIZES, JSON.stringify(sizes, null, 1) + "\n");
console.log(`images: ${files.size} referenced, ${built} rebuilt, ${small} small thumbs`);
