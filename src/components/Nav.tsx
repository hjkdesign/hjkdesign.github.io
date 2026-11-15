"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";
import { pageSeq } from "@/lib/tracks";
import s from "./ui.module.css";

/** `current` lets a work page highlight its chapter. */
export function Nav({ current }: { current?: string }) {
	const pathname = usePathname();
	// trailingSlash gives "/about/"; compare without it.
	const path = current ?? pathname.replace(/(.)\/$/, "$1");
	// Phones (≤760px): the menu folds behind a Menu button and opens full-screen.
	const [open, setOpen] = useState(false);
	const [prevPath, setPrevPath] = useState(path);
	if (path !== prevPath) {
		// Close the menu once a link has taken us to another page.
		setPrevPath(path);
		setOpen(false);
	}
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);
	// Black pages (cover, About) get the black/pink bar.
	const dark = path === "/" || path === "/about";
	return (
		<header
			className={[s.nav, dark && s.dark, path === "/about" && s.whiteLinks]
				.filter(Boolean)
				.join(" ")}
		>
			<Link href="/" className={s.brand}>
				{profile.nameEn.toUpperCase()}
			</Link>
			<button
				type="button"
				className={s.menuBtn}
				aria-expanded={open}
				aria-controls="site-menu"
				onClick={() => setOpen((o) => !o)}
			>
				{open ? "Close" : "Menu"}
			</button>
			<nav id="site-menu" className={`${s.links} ${open ? s.open : ""}`}>
				{pageSeq.slice(1).map((p) => (
					<Link
						key={p.href}
						href={p.href}
						className={p.href === path ? s.on : undefined}
						aria-current={p.href === path ? "page" : undefined}
						onClick={() => setOpen(false)}
					>
						{p.short}
					</Link>
				))}
			</nav>
		</header>
	);
}
