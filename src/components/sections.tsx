import Link from "next/link";
import { Card } from "@/components/ui";
import { profile } from "@/data/profile";
import { type Chapter, pageSeq } from "@/lib/tracks";
import s from "./sections.module.css";

/** Not-found page: same black/pink as the cover, plain Inter "404" (script type is kept for headline pages). */
export function NotFound() {
	return (
		<section className={s.cover}>
			<h1 className={s.nfCode}>404</h1>
			<p className={s.nfMsg}>페이지를 찾을 수 없습니다.</p>
			<p className={s.nfSub}>주소가 바뀌었거나 삭제된 페이지예요.</p>
			<Link href="/" className={s.cta}>
				Home <span aria-hidden>→</span>
			</Link>
		</section>
	);
}


export function LinerNotes() {
	const rows = [
		...profile.credits,
		{ label: "CONTACT", value: `${profile.email} / ${profile.phone}` },
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
			<p className={s.copy}>© {profile.nameEn}</p>
		</section>
	);
}

/** Previous / next page in the reading order (cover → about → chapters → contact). */
// Prev/next walks the work chapters and Contact only; Cover and About sit outside it.
const pagerSeq = pageSeq.filter((p) => p.href !== "/" && p.href !== "/about");

export function PagePager({ href }: { href: string }) {
	const i = pagerSeq.findIndex((p) => p.href === href);
	const prev = pagerSeq[i - 1];
	const next = pagerSeq[i + 1];
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
