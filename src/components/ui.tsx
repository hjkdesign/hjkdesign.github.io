import Image from "next/image";
import Link from "next/link";
import { chapterOf, size, src, type Track } from "@/lib/tracks";
import s from "./ui.module.css";

/** A work printed on white paper, rotated and absolutely placed by the caller's style. */
export function Print({
	track,
	style,
	priority,
}: {
	track: Track;
	style: React.CSSProperties;
	priority?: boolean;
}) {
	const [w, h] = size(track.thumb);
	return (
		<Link href={`/works/${track.id}`} className={s.print} style={style}>
			<Image
				className={s.thumb}
				src={src(track.thumb)}
				width={w}
				height={h}
				alt={track.label}
				priority={priority}
			/>
			<span className={s.printCap}>
				<span>{track.label}</span>
				<i>
					{track.code} · {chapterOf(track).en.toUpperCase()}
				</i>
			</span>
		</Link>
	);
}

export function Card({ track }: { track: Track }) {
	const [w, h] = size(track.thumb);
	return (
		<Link href={`/works/${track.id}`} className={s.card}>
			<Image
				className={s.thumb}
				src={src(track.thumb)}
				width={w}
				height={h}
				alt={track.label}
			/>
			<span className={s.cardTitle}>{track.label}</span>
			<span className={s.cardCode}>
				{track.code} · {chapterOf(track).en.toUpperCase()}
			</span>
		</Link>
	);
}
