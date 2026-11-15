// Shared data for the main-page prototypes under /lab (A/B candidates for the cover).
// Both prototypes use the same selection rule and the same small thumbnails, so the
// comparison is about the motion only.
import { chapters } from "@/lib/tracks";

export type LabItem = {
	id: string;
	href: string;
	label: string;
	thumb: string;
};
export type LabCat = { href: string; label: string; n: number };

export const labCats: LabCat[] = chapters.map((c) => ({
	href: `/${c.id}`,
	label: c.short,
	n: c.tracks.length,
}));

// 256px WebP made by scripts/build-images.mjs (public/media/s/).
const smallThumb = (name: string) =>
	`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/media/s/${name.replace(/\.[^.]+$/, "")}.webp`;

/** First `n` works, taking one per category in turn, each category in CMS order. */
export function pickItems(n: number): LabItem[] {
	const queues = chapters.map((c) => [...c.tracks]);
	const out: LabItem[] = [];
	while (out.length < n && queues.some((q) => q.length)) {
		for (const q of queues) {
			const t = q.shift();
			if (t && out.length < n)
				out.push({
					id: t.id,
					href: `/works/${t.id}`,
					label: t.label,
					thumb: smallThumb(t.thumb),
				});
		}
	}
	return out;
}
