// Collects content/works/<id>.json (one file per work, edited in the CMS) into
// src/data/works.generated.json, sorted by the CMS's manual `order`.
// The file name is the work's ID and page URL (/works/<id>/).
// Runs before `next dev` / `next build`; the output is gitignored.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "content", "works");
const OUT = path.join(ROOT, "src", "data", "works.generated.json");

const files = (await readdir(DIR)).filter((f) => f.endsWith(".json"));
const works = await Promise.all(
	files.map(async (f) => {
		const { order, ...work } = JSON.parse(await readFile(path.join(DIR, f), "utf8"));
		return { id: f.replace(/\.json$/, ""), order: Number(order) || Infinity, ...work };
	}),
);
// Manual order first; entries without one (shouldn't happen) go last, by ID.
works.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

for (const w of works) delete w.order;
await writeFile(OUT, `${JSON.stringify({ works }, null, 1)}\n`);
console.log(`content: ${works.length} works`);
