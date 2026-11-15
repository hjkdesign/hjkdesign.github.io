import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Contact, PagePager } from "@/components/sections";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
	title: `Contact — ${profile.nameKr} Portfolio`,
};

export default function ContactPage() {
	return (
		<>
			<Nav />
			<main>
				<Contact />
				<PagePager href="/contact" />
			</main>
		</>
	);
}
