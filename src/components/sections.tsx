import Link from "next/link";
import { Card, Print } from "@/components/ui";
import { profile } from "@/data/profile";
import { type Chapter, findTrack, pageSeq } from "@/lib/tracks";
import s from "./sections.module.css";

const pick = (id: string) => findTrack(id)!;

export function Cover() {
	return (
		<section className={s.cover}>
			<h1 className={s.coverTitle}>Portfolio</h1>
			<p className={s.coverRole}>{profile.role}</p>
			<p className={s.coverMeta}>
				{profile.nameKr} · {profile.nameEn}
			</p>
			<Link href="/about" className={s.cta}>
				작업 보기 <span aria-hidden>→</span>
			</Link>
		</section>
	);
}

export function LinerNotes() {
	const rows = [
		...profile.credits,
		{ label: "CONTACT", value: `${profile.email} · ${profile.phone}` },
	];
	return (
		<section className={s.liner}>
			<h1 className={`${s.script} ${s.linerTitle}`}>Liner notes</h1>
			<div className={s.linerBody}>
				<div>
					<p className={s.linerIntro}>{profile.intro}</p>
					<p className={s.linerBio}>{profile.bio}</p>
				</div>
				<dl className={s.credits}>
					{rows.map((c) => (
						<div key={c.label}>
							<dt>{c.label}</dt>
							<dd>{c.value}</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}

export function ChapterSection({ c }: { c: Chapter }) {
	const layout =
		c.tracks.length === 1 ? s.gridOne : c.tracks.length === 2 ? s.gridTwo : "";
	return (
		<section className={s.chapter}>
			<header className={s.chapterHead}>
				<h1 className={s.chapterTitle}>{c.en}</h1>
			</header>
			<div className={`${s.grid} ${layout}`}>
				{c.tracks.map((t) => (
					<Card key={t.id} track={t} />
				))}
			</div>
		</section>
	);
}

export function Contact() {
	return (
		<section className={s.contact}>
			<div>
				<p className={s.kickerDark}>BONUS TRACK</p>
				<h1 className={`${s.script} ${s.contactTitle}`}>
					Let&apos;s work together
				</h1>
				<p className={s.contactInfo}>
					<a href={`mailto:${profile.email}`}>{profile.email}</a>
					<br />
					<a href={`tel:${profile.phone}`}>{profile.phone}</a>
					<br />
					<a href={profile.resumeUrl} className={s.u}>
						Resume (PDF) ↓
					</a>
				</p>
			</div>
			<div className={s.contactPrints}>
				<Print
					track={pick("package-tint")}
					style={{ left: "18%", top: "0%", width: "70%", rotate: "5deg" }}
				/>
				<Print
					track={pick("poster-treatment")}
					style={{ left: "6%", top: "44%", width: "66%", rotate: "-4deg" }}
				/>
			</div>
			<p className={s.copy}>© {profile.nameEn}</p>
		</section>
	);
}

/** Previous / next page in the reading order (cover → about → chapters → contact). */
export function PagePager({ href }: { href: string }) {
	const i = pageSeq.findIndex((p) => p.href === href);
	const prev = pageSeq[i - 1];
	const next = pageSeq[i + 1];
	return (
		<nav className={s.pager}>
			{prev ? (
				<Link href={prev.href} className={s.pagerLink}>
					<span>← PREV</span>
					{prev.label}
				</Link>
			) : (
				<span />
			)}
			{next ? (
				<Link href={next.href} className={`${s.pagerLink} ${s.pagerNext}`}>
					<span>NEXT →</span>
					{next.label}
				</Link>
			) : (
				<span />
			)}
		</nav>
	);
}
