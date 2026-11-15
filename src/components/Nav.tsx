"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { profile } from "@/data/profile";
import { pageSeq } from "@/lib/tracks";
import s from "./ui.module.css";

/** `current` lets a work page highlight its chapter. */
export function Nav({ current }: { current?: string }) {
	const pathname = usePathname();
	// trailingSlash gives "/about/"; compare without it.
	const path = current ?? (pathname.replace(/(.)\/$/, "$1"));
	const links = useRef<HTMLElement>(null);
	// On phones the menu scrolls sideways: keep the current page in view.
	useEffect(() => {
		const nav = links.current;
		const on = nav?.querySelector<HTMLElement>("[aria-current=page]");
		if (nav && on) nav.scrollLeft = on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2;
	}, [path]);
	// Black pages (cover, About) get the black/pink bar.
	const dark = path === "/" || path === "/about";
	return (
		<header className={dark ? `${s.nav} ${s.dark}` : s.nav}>
			<Link href="/" className={s.brand}>
				{profile.nameEn.toUpperCase()}
			</Link>
			<nav ref={links} className={s.links}>
				{pageSeq.slice(1).map((p) => (
					<Link
						key={p.href}
						href={p.href}
						className={p.href === path ? s.on : undefined}
						aria-current={p.href === path ? "page" : undefined}
					>
						{p.short}
					</Link>
				))}
			</nav>
		</header>
	);
}
