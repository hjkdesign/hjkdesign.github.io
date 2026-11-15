import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ChapterSection, PagePager } from "@/components/sections";
import { profile } from "@/data/profile";
import { chapters } from "@/lib/tracks";

export function generateStaticParams() {
	return chapters.map((c) => ({ category: c.id }));
}

const find = (id: string) => chapters.find((c) => c.id === id);

export async function generateMetadata({
	params,
}: PageProps<"/[category]">): Promise<Metadata> {
	const c = find((await params).category);
	return {
		title: c ? `${c.en} — ${profile.nameKr} Portfolio` : profile.nameKr,
	};
}

export default async function CategoryPage({
	params,
}: PageProps<"/[category]">) {
	const c = find((await params).category);
	if (!c) notFound();
	return (
		<>
			<Nav />
			<main>
				<ChapterSection c={c} />
				<PagePager href={`/${c.id}`} />
			</main>
		</>
	);
}
