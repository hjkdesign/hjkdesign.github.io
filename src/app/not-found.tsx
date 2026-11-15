import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { NotFound } from "@/components/sections";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
	title: `404 — ${profile.nameKr} Portfolio`,
};

// Exported as out/404.html, which GitHub Pages serves for unknown URLs.
export default function NotFoundPage() {
	return (
		<>
			<Nav dark />
			<main>
				<NotFound />
			</main>
		</>
	);
}
