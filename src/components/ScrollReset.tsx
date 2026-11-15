"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Next.js keeps the scroll position when the new page is already in view, which
// leaves you mid-page after "next track". Jump to the top on link navigation,
// but leave back/forward (popstate) alone so the browser restores the old spot.
let fromHistory = false;
if (typeof window !== "undefined") {
	window.addEventListener("popstate", () => {
		fromHistory = true;
	});
}

export function ScrollReset() {
	const pathname = usePathname();
	useEffect(() => {
		if (fromHistory) {
			fromHistory = false;
			return;
		}
		window.scrollTo({ top: 0, behavior: "instant" });
	}, [pathname]);
	return null;
}
