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
	info: WorkInfo;
};

/** Project overview shown above the images. Every field is optional; empty ones are hidden. */
export type WorkInfo = {
	summary?: string;
	client?: string;
	period?: string;
	contribution?: number; // 0–100 (%)
	media: string[];
	role: string[];
	tools: string[];
	challenge?: string;
	result?: string;
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
} & Partial<
	Record<"summary" | "client" | "period" | "challenge" | "result", string>
> &
	Partial<Record<"media" | "role" | "tools", string | string[]>> & { contribution?: number | string };

// The CMS may save an empty field as "", null or [] — treat all of those as "not set".
const text = (v?: string) => v?.trim() || undefined;
// Badge fields are typed as "모바일 웹, SNS" in the CMS: split on commas (half- or full-width).
const list = (v?: string | string[]) =>
	[v ?? []]
		.flat()
		.flatMap((x) => String(x).split(/[,，、]/))
		.map((x) => x.trim())
		.filter(Boolean);
// Period is saved by the admin as "2024.03 ~ 2024.04" (or "2024.03"); half-typed parts are dropped.
const month = (v: string) => {
	const m = v.trim().match(/^(\d{4})\.(\d{1,2})$/);
	return m && +m[2] >= 1 && +m[2] <= 12 ? `${m[1]}.${m[2].padStart(2, "0")}` : undefined;
};
const period = (v?: string) => {
	const [a, b] = (v ?? "").split(/[~–—]/).map(month);
	return a && b && a !== b ? `${a} – ${b}` : a || b;
};
const percent = (v?: number | string) => {
	const n = Number(v);
	return v === "" || v == null || Number.isNaN(n) ? undefined : Math.min(100, Math.max(0, n));
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
		info: {
			summary: text(w.summary),
			client: text(w.client),
			period: period(w.period),
			contribution: percent(w.contribution),
			media: list(w.media),
			role: list(w.role),
			tools: list(w.tools),
			challenge: text(w.challenge),
			result: text(w.result),
		},
	};
});

const ids = works.map((w) => w.id);
const dup = ids.find((id, i) => ids.indexOf(id) !== i);
if (dup) throw new Error(`content/works.json: duplicate id "${dup}"`);
