// Builds the display copies of every file the content references.
//   content/media/<file>  (originals, uploaded through the CMS)
//   → public/media/<file> (JPG/PNG/WebP ≤1200px wide; GIF, animated WebP and PDF copied as-is)
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

// GIFs and animated WebPs keep all their frames (a plain resize keeps only the first).
const animatedCache = new Map();
const isAnimated = async (name) => {
	if (/\.gif$/i.test(name)) return true;
	if (!/\.webp$/i.test(name)) return false;
	if (!animatedCache.has(name))
		animatedCache.set(name, ((await sharp(path.join(MEDIA, name)).metadata()).pages ?? 1) > 1);
	return animatedCache.get(name);
};

await mkdir(OUT, { recursive: true });
for (const name of [...files].sort()) {
	const src = path.join(MEDIA, name);
	const dst = path.join(OUT, name);
	if (!(await mtime(src))) throw new Error(`content/media/${name} is referenced but missing`);
	const fresh = (await mtime(dst)) >= (await mtime(src));

	if (/\.pdf$/i.test(name) || (await isAnimated(name))) {
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

// Small WebP copies of the thumbnails for the cover ring: ~7 KB each
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

// What the pages actually show: WebP, lighter than the JPG/GIF copies above
// (those stay for share previews and the résumé).
//   thumbnails → public/media/t/<name>.webp, ≤800px wide (list cards), GIFs keep moving
//   work images → public/media/w/<name>-<i>.webp, ≤1200px wide, cut into pieces of
//   PIECE px height so a long landing page shows its top before the rest arrives.
//   The piece heights go into image-sizes.json as the third value.
const PIECE = 2000;
const THUMB_WIDTH = 800;
const THUMBS = path.join(OUT, "t");
const WORK = path.join(OUT, "w");
await mkdir(THUMBS, { recursive: true });
await mkdir(WORK, { recursive: true });
const stem = (n) => n.replace(/\.[^.]+$/, "");
const load = (src, animated) =>
	sharp(src, { limitInputPixels: false, animated }).rotate();
let webp = 0;

for (const name of new Set(works.map((w) => base(w.thumb)))) {
	const src = path.join(MEDIA, name);
	const dst = path.join(THUMBS, `${stem(name)}.webp`);
	if ((await mtime(dst)) >= (await mtime(src))) continue;
	await load(src, await isAnimated(name))
		.resize({ width: THUMB_WIDTH, withoutEnlargement: true })
		.webp({ quality: 80 })
		.toFile(dst);
	webp++;
}

for (const name of new Set(works.flatMap((w) => w.images).map(base))) {
	const src = path.join(MEDIA, name);
	const animated = await isAnimated(name);
	const [w, h] = sizes[name];
	const n = animated ? 1 : Math.ceil(h / PIECE);
	const heights = Array.from({ length: n }, (_, i) => Math.min(PIECE, h - i * PIECE));
	if (n > 1) sizes[name] = [w, h, heights];
	const out = (i) => path.join(WORK, `${stem(name)}-${i}.webp`);
	if ((await mtime(out(n - 1))) >= (await mtime(src))) continue;
	if (animated) {
		await load(src, true).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out(0));
	} else {
		// Resize once, then cut the pieces out of the resized pixels.
		const { data, info } = await load(src, false)
			.resize({ width: MAX_WIDTH, withoutEnlargement: true })
			.raw()
			.toBuffer({ resolveWithObject: true });
		const raw = { raw: { width: info.width, height: info.height, channels: info.channels } };
		for (let i = 0; i < n; i++)
			await sharp(data, raw)
				.extract({ left: 0, top: i * PIECE, width: info.width, height: heights[i] })
				.webp({ quality: 80 })
				.toFile(out(i));
	}
	webp += n;
}

await writeFile(SIZES, JSON.stringify(sizes, null, 1) + "\n");
console.log(`images: ${files.size} referenced, ${built} rebuilt, ${small} small thumbs, ${webp} webp`);
