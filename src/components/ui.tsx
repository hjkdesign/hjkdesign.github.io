import Image from "next/image";
import Link from "next/link";
import { chapterOf, size, src, type Track } from "@/lib/tracks";
import s from "./ui.module.css";

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
				{chapterOf(track).en.toUpperCase()}
			</span>
		</Link>
	);
}
