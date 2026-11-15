// Data for the cover (Orbit): the category tags and the works on the ring.

import { chapters, type Track } from "@/lib/tracks";
import orbit from "../../content/orbit.json";

export type CoverItem = {
	id: string;
	href: string;
	label: string;
	thumb: string;
};
export type CoverCat = { href: string; label: string; n: number };

/** How many works the ring takes. The CMS enforces the same limits (설정 → 메인 궤도). */
export const ORBIT_MIN = 8;
export const ORBIT_MAX = 24;

export const coverCats: CoverCat[] = chapters.map((c) => ({
	href: `/${c.id}`,
	label: c.short,
	n: c.tracks.length,
}));

// 256px WebP made by scripts/build-images.mjs (public/media/s/).
const smallThumb = (name: string) =>
	`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/media/s/${name.replace(/\.[^.]+$/, "")}.webp`;

/** Matching works, one category at a time (each in CMS order), so neighbours on the ring differ. */
const mixed = (keep: (t: Track) => boolean) => {
	const queues = chapters.map((c) => c.tracks.filter(keep));
	const out: Track[] = [];
	while (queues.some((q) => q.length))
		for (const q of queues) {
			const t = q.shift();
			if (t) out.push(t);
		}
	return out;
};

/**
 * The works chosen in the CMS. If fewer than ORBIT_MIN are left (say a chosen work was
 * deleted), the ring is topped up from the rest in CMS order so it never looks empty.
 */
export function orbitItems(): CoverItem[] {
	const chosen = new Set<string>(orbit.works);
	let picked = mixed((t) => chosen.has(t.id)).slice(0, ORBIT_MAX);
	if (picked.length < ORBIT_MIN)
		picked = [...picked, ...mixed((t) => !chosen.has(t.id))].slice(
			0,
			ORBIT_MIN,
		);
	return picked.map((t) => ({
		id: t.id,
		href: `/works/${t.id}`,
		label: t.label,
		thumb: smallThumb(t.thumb),
	}));
}
