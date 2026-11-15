import { Nav } from "@/components/Nav";
import { Orbit } from "@/components/Orbit";
import { coverCats, orbitItems } from "@/lib/cover";

export default function Home() {
	return (
		<>
			<Nav />
			<main>
				<Orbit items={orbitItems()} cats={coverCats} />
			</main>
		</>
	);
}
