import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { profile } from "@/data/profile";
import { labCats, pickItems } from "@/lib/lab";
import { Drop } from "./Drop";

// Prototype B for the cover (A/B with /lab/orbit). Not linked anywhere, kept out of search.
export const metadata: Metadata = {
	title: `Lab: Drop — ${profile.nameKr} Portfolio`,
	robots: { index: false, follow: false },
};

// Same selection rule as Orbit: 8 thumbnails, then 6 work titles.
const picked = pickItems(14);

export default function DropLab() {
	return (
		<>
			<Nav dark />
			<main>
				<Drop
					cats={labCats}
					thumbs={picked.slice(0, 8)}
					titles={picked.slice(8)}
				/>
			</main>
		</>
	);
}
