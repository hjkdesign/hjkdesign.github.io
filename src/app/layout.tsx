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

const description = `${profile.nameKr} 그래픽 디자이너 포트폴리오 · 랜딩페이지 · 광고 · 캐릭터 · 패키지 · 포스터`;

export const metadata: Metadata = {
	// Share previews (KakaoTalk etc.) need absolute image URLs.
	metadataBase: new URL("https://hjkdesign.github.io"),
	title: `${profile.nameKr} — Portfolio`,
	description,
	// public/og.png: the cover design at 1200×630. Work pages swap in their thumbnail.
	openGraph: {
		type: "website",
		siteName: `${profile.nameKr} Portfolio`,
		title: `${profile.nameKr} — Portfolio`,
		description,
		images: [
			{
				url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/og.png`,
				width: 1200,
				height: 630,
			},
		],
	},
	twitter: { card: "summary_large_image" },
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
