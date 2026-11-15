import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Card } from "@/components/ui";
import { profile } from "@/data/profile";
import type { WorkInfo } from "@/data/works";
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
					<Overview info={track.info} />
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

/** Project overview: lead text, a spec sheet of facts, then challenge / result. Empty parts are left out.
 * Multi-value fields (media, role, tools) read as plain text: "디자인, 일러스트". */
function Overview({ info }: { info: WorkInfo }) {
	const facts = [
		info.brand && { label: "Brand", value: info.brand },
		info.period && { label: "Period", value: info.period },
		info.contribution != null && {
			label: "Contribution",
			value: (
				<span className={s.meter}>
					{info.contribution}%
					<span aria-hidden className={s.meterBar}>
						<span style={{ width: `${info.contribution}%` }} />
					</span>
				</span>
			),
		},
		info.media.length > 0 && { label: "Media", value: info.media.join(", ") },
		info.role.length > 0 && { label: "Role", value: info.role.join(", ") },
		info.tools.length > 0 && { label: "Tools", value: info.tools.join(", ") },
	].filter((f) => !!f);
	const story = [
		info.challenge && { label: "Challenge", text: info.challenge },
		info.result && { label: "Result", text: info.result },
	].filter((f) => !!f);

	if (!info.summary && !facts.length && !story.length) return null;
	return (
		<div className={s.overview}>
			{info.summary && <p className={s.summary}>{info.summary}</p>}
			{facts.length > 0 && (
				<dl className={s.facts}>
					{facts.map((f) => (
						<div key={f.label}>
							<dt>{f.label}</dt>
							<dd>{f.value}</dd>
						</div>
					))}
				</dl>
			)}
			{story.length > 0 && (
				<div className={s.story}>
					{story.map((f) => (
						<section key={f.label}>
							<h2>{f.label}</h2>
							<p>{f.text}</p>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
