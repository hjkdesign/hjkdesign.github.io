import type { Metadata } from "next";
import {
	Instrument_Serif,
	Inter,
	Noto_Sans_KR,
	Pinyon_Script,
} from "next/font/google";
import { ScrollReset } from "@/components/ScrollReset";
import { profile } from "@/data/profile";
import "./globals.css";

const script = Pinyon_Script({
	weight: "400",
	subsets: ["latin"],
	variable: "--f-script",
});
const serif = Instrument_Serif({
	weight: "400",
	style: "italic",
	subsets: ["latin"],
	variable: "--f-serif",
});
const sans = Inter({ subsets: ["latin"], variable: "--f-sans" });
// Korean glyphs come in many unicode-range slices; skip preload rather than preloading all of them.
const kr = Noto_Sans_KR({
	weight: ["400", "500", "600", "700"],
	preload: false,
	variable: "--f-kr",
});

export const metadata: Metadata = {
	title: `${profile.nameKr} — Portfolio`,
	description: `${profile.nameKr} 그래픽 디자이너 포트폴리오 · 랜딩페이지 · 광고 · 캐릭터 · 패키지 · 포스터`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="ko"
			className={`${script.variable} ${serif.variable} ${sans.variable} ${kr.variable}`}
		>
			<body id="top">
				<ScrollReset />
				{children}
			</body>
		</html>
	);
}
