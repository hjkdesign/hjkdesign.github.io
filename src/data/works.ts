import data from "../../content/works.json";

// Works are edited in the CMS (/admin) and stored in content/works.json.
// Order inside a category = display order. Media paths ("/media/x.jpg") are
// reduced to file names; `pnpm images` builds the display copies in public/media.

export type CategoryId = "landing" | "ad" | "character" | "package" | "poster";

export type Category = {
	id: CategoryId;
	en: string;
	short: string; // menu label
	kr: string;
	side: "A" | "B";
};

export type Work = {
	id: string;
	category: CategoryId;
	title?: string;
	thumb: string;
	images: string[];
};

export const categories: Category[] = [
	{
		id: "landing",
		en: "Landing Page",
		short: "Landing",
		kr: "랜딩페이지",
		side: "A",
	},
	{ id: "ad", en: "Advertisement", short: "AD", kr: "광고", side: "A" },
	{
		id: "character",
		en: "Character",
		short: "Character",
		kr: "캐릭터",
		side: "A",
	},
	{ id: "package", en: "Package", short: "Package", kr: "패키지", side: "B" },
	{
		id: "poster",
		en: "Poster / etc.",
		short: "Poster",
		kr: "포스터 외",
		side: "B",
	},
];

const name = (path: string) => path.split("/").pop() ?? path;

type RawWork = {
	id?: string;
	category?: string;
	title?: string;
	thumb?: string;
	images?: string[];
};

// Fail the build (and so the deploy) on incomplete CMS entries instead of publishing a broken page.
export const works: Work[] = (data.works as RawWork[]).map((w, i) => {
	const where = `content/works.json #${i + 1}${w.title ? ` (${w.title})` : ""}`;
	if (!w.id) throw new Error(`${where}: missing id`);
	if (!categories.some((c) => c.id === w.category))
		throw new Error(`${where}: unknown category "${w.category}"`);
	if (!w.thumb) throw new Error(`${where}: missing thumbnail`);
	if (!w.images?.length) throw new Error(`${where}: no detail images`);
	return {
		id: w.id,
		category: w.category as CategoryId,
		title: w.title || undefined,
		thumb: name(w.thumb),
		images: w.images.map(name),
	};
});

const ids = works.map((w) => w.id);
const dup = ids.find((id, i) => ids.indexOf(id) !== i);
if (dup) throw new Error(`content/works.json: duplicate id "${dup}"`);
