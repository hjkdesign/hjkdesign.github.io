// Derives everything the playlist layout shows (chapters, track codes, page order) from data/works.

import imageSizes from "@/data/image-sizes.json";
import { type Category, categories, type Work, works } from "@/data/works";

export type Track = Work & {
	code: string; // A1, A2 … continuous per side
	label: string; // title, or "랜딩페이지 01" when untitled
};

export type Chapter = Category & { tracks: Track[] };

const counters = { A: 0, B: 0 };

export const chapters: Chapter[] = categories.map((c) => {
	const items = works.filter((w) => w.category === c.id);
	return {
		...c,
		tracks: items.map((w, j) => ({
			...w,
			code: `${c.side}${++counters[c.side]}`,
			label: w.title ?? `${c.kr} ${String(j + 1).padStart(2, "0")}`,
		})),
	};
});

export const tracks: Track[] = chapters.flatMap((c) => c.tracks);
// Reading order of the site, page by page: cover → about → chapters → contact.
export const pageSeq = [
	{ href: "/", label: "Cover", short: "Cover" },
	{ href: "/about", label: "About", short: "About" },
	...chapters.map((c) => ({
		href: `/${c.id}`,
		label: c.en,
		short: c.short,
	})),
	{ href: "/contact", label: "Contact", short: "Contact" },
];

export const chapterOf = (t: Track) =>
	chapters.find((c) => c.id === t.category)!;
export const findTrack = (id: string) => tracks.find((t) => t.id === id);

// next/image does not add basePath to string paths, so prefix it here.
export const src = (name: string) =>
	`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/media/${name}`;
export const size = (name: string) =>
	(imageSizes as Record<string, number[]>)[name] ?? [1200, 800];
