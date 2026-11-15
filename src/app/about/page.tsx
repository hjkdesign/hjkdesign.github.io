import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { LinerNotes } from "@/components/sections";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
	title: `About - ${profile.nameKr} Portfolio`,
};

export default function AboutPage() {
	return (
		<>
			<Nav />
			<main>
				<LinerNotes />
			</main>
		</>
	);
}
