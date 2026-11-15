import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { profile } from "@/data/profile";
import { labCats, pickItems } from "@/lib/lab";
import { Orbit } from "./Orbit";

// Prototype A for the cover (A/B with /lab/drop). Not linked anywhere, kept out of search.
export const metadata: Metadata = {
	title: `Lab: Orbit — ${profile.nameKr} Portfolio`,
	robots: { index: false, follow: false },
};

export default function OrbitLab() {
	return (
		<>
			<Nav dark />
			<main>
				<Orbit items={pickItems(24)} cats={labCats} />
			</main>
		</>
	);
}
