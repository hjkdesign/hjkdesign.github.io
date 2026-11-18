// Deletes images that a save took out of the works, so the CMS asset library only
// holds files the site uses.
//   node scripts/prune-media.mjs --all         files removed at any point in history (the deploy runs this)
//   node scripts/prune-media.mjs <from> <to>   files removed between two commits
// A file is deleted only when it was once used by a work (or as the résumé) and
// nothing uses it now, so an image shared by two works stays until both drop it,
// and a file uploaded to the asset library but never put in a work is left alone.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA = path.join(ROOT, "content", "media");
const WATCHED = ["content/works", "content/profile.json"];
const names = (text) => [...text.matchAll(/\/media\/([^"\s]+)/g)].map((m) => m[1]);
const git = (...args) =>
	execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });

// Media names on the removed side of the diff.
const args = process.argv.slice(2);
const patch =
	args[0] === "--all"
		? git("log", "-p", "--format=", "--", ...WATCHED)
		: git("diff", "--unified=0", args[0], args[1], "--", ...WATCHED);
const removed = new Set(
	patch
		.split("\n")
		.filter((l) => l.startsWith("-") && !l.startsWith("---"))
		.flatMap(names),
);

// Media names in use now.
const worksDir = path.join(ROOT, "content", "works");
const used = new Set(
	[
		...readdirSync(worksDir).map((f) => readFileSync(path.join(worksDir, f), "utf8")),
		readFileSync(path.join(ROOT, "content", "profile.json"), "utf8"),
	].flatMap(names),
);

const gone = [...removed].filter((n) => !used.has(n) && existsSync(path.join(MEDIA, n)));
for (const n of gone) rmSync(path.join(MEDIA, n));
console.log(gone.length ? `deleted ${gone.length}:\n${gone.join("\n")}` : "nothing to delete");
