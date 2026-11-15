import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Card } from "@/components/ui";
import { profile } from "@/data/profile";
import { chapterOf, findTrack, size, src, tracks } from "@/lib/tracks";
import s from "./detail.module.css";

export function generateStaticParams() {
	return tracks.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
	params,
}: PageProps<"/works/[id]">): Promise<Metadata> {
	const t = findTrack((await params).id);
	return {
		title: t ? `${t.label} — ${profile.nameKr} Portfolio` : profile.nameKr,
	};
}

export default async function WorkPage({ params }: PageProps<"/works/[id]">) {
	const { id } = await params;
	const track = findTrack(id);
	if (!track) notFound();

	const chapter = chapterOf(track);
	const i = tracks.indexOf(track);
	const prev = tracks[i - 1];
	const next = tracks[i + 1];
	// Landing pages are one long page split into parts: stack them without gaps.
	const continuous = track.category === "landing";
	// Align the header with the image column (images show at their own width, max 1200).
	const columnWidth = size(track.images[0])[0];

	return (
		<>
			<Nav current={`/${chapter.id}`} />
			<main>
				<header
					className={s.head}
					style={{ maxWidth: `${columnWidth + 40}px` }}
				>
					<Link href={`/${chapter.id}`} className={s.back}>
						← {chapter.en}
					</Link>
					<h1 className={s.title}>{track.label}</h1>
				</header>

				<div className={`${s.images} ${continuous ? s.continuous : ""}`}>
					{track.images.map((name, n) => {
						const [w, h] = size(name);
						return (
							<Image
								key={name}
								src={src(name)}
								width={w}
								height={h}
								alt={`${track.label} ${n + 1}`}
								style={{ maxWidth: `${w}px` }}
								priority={n === 0}
							/>
						);
					})}
				</div>

				<nav className={s.pager}>
					<div>
						{prev && (
							<>
								<p className={s.pagerLabel}>← PREV TRACK</p>
								<Card track={prev} />
							</>
						)}
					</div>
					<Link href={`/${chapter.id}`} className={s.toList}>
						{chapter.en}
					</Link>
					<div>
						{next && (
							<>
								<p className={`${s.pagerLabel} ${s.right}`}>NEXT TRACK →</p>
								<Card track={next} />
							</>
						)}
					</div>
				</nav>
			</main>
			<a href="#top" className={s.top} aria-label="맨 위로">
				TOP
			</a>
		</>
	);
}
