// Deletes media files no work uses, so the CMS asset library only holds what the site
// shows. The deploy runs it on every push: `node scripts/prune-media.mjs`.
// A file nothing uses now (no work, not the résumé) is deleted when either
//   - it was used before: a save took it out of a work or deleted the work, or
//   - it was never used and was added over GRACE ago: left over from a failed save,
//     or uploaded to the asset library and never put in a work.
// GRACE matters because the CMS saves a new work as several commits (large images
// first, the work file last) and each one starts a deploy: images of a save still
// in progress must survive until the work file that uses them lands.
// An image shared by two works stays until both drop it.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const GRACE = 60 * 60; // seconds
const ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA = path.join(ROOT, "content", "media");
const WATCHED = ["content/works", "content/profile.json"];
const names = (text) => [...text.matchAll(/\/media\/([^"\s]+)/g)].map((m) => m[1]);
const git = (...args) =>
	execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });

// In use now.
const worksDir = path.join(ROOT, "content", "works");
const used = new Set(
	[
		...readdirSync(worksDir).map((f) => readFileSync(path.join(worksDir, f), "utf8")),
		readFileSync(path.join(ROOT, "content", "profile.json"), "utf8"),
	].flatMap(names),
);

// Ever used: on the removed side of any change to the works or the profile.
const usedBefore = new Set(
	git("log", "-p", "--format=", "--", ...WATCHED)
		.split("\n")
		.filter((l) => l.startsWith("-") && !l.startsWith("---"))
		.flatMap(names),
);

// When each file was (last) added. Untracked files have no entry and count as new.
const addedAt = new Map();
let time = 0;
// quotePath off: Korean file names come out as is, not as octal escapes.
const adds = git("-c", "core.quotePath=false", "log", "--diff-filter=A", "--format=%ct", "--name-only", "--", "content/media");
for (const line of adds.split("\n")) {
	if (/^\d+$/.test(line)) time = Number(line);
	else if (line) {
		const name = line.replace(/^content\/media\//, "");
		if (!addedAt.has(name)) addedAt.set(name, time); // log is newest first
	}
}

const now = Date.now() / 1000;
const gone = readdirSync(MEDIA).filter(
	(n) =>
		!used.has(n) &&
		(usedBefore.has(n) || (addedAt.has(n) && now - addedAt.get(n) > GRACE)),
);
for (const n of gone) rmSync(path.join(MEDIA, n));
console.log(gone.length ? `deleted ${gone.length}:\n${gone.join("\n")}` : "nothing to delete");
