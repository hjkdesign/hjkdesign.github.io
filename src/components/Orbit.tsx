"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { CoverCat, CoverItem } from "@/lib/cover";
import s from "./orbit.module.css";

const TAU = Math.PI * 2;
const BASE_SPEED = 0.12; // rad/s with no input
const MAX_TILT = 0.35; // rad
const clamp = (v: number, lo: number, hi: number) =>
	Math.min(hi, Math.max(lo, v));

// Where each thing sits on the ring (angle) and how close it is (depth 0 back → 1 front).
// Deterministic, so the server HTML is also the still frame for reduced motion.
const place = (a: number) => {
	const d = (Math.sin(a) + 1) / 2;
	return {
		"--x": `${50 + 40 * Math.cos(a)}%`,
		"--y": `${52 + 14 * Math.sin(a)}%`,
		"--sc": 0.55 + 0.45 * d,
		"--op": 0.35 + 0.65 * d,
		"--z": d > 0.5 ? 3 : 1,
	} as CSSProperties;
};
const DOTS = Array.from({ length: 18 }, (_, i) => ({
	a: ((i * 137.5) % 360) * (TAU / 360),
	cream: i % 3 === 0,
}));

/** Cover: work thumbnails orbit the "Portfolio" title; category tags float around it. */
export function Orbit({ items, cats }: { items: CoverItem[]; cats: CoverCat[] }) {
	const stage = useRef<HTMLDivElement>(null);
	const cap = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = stage.current;
		if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const nodes = [...el.querySelectorAll<HTMLElement>("[data-a]")].map(
			(n) => ({ n, a0: Number(n.dataset.a) }),
		);
		let w = el.clientWidth;
		let h = el.clientHeight;
		const ro = new ResizeObserver(() => {
			w = el.clientWidth;
			h = el.clientHeight;
		});
		ro.observe(el);
		el.classList.add(s.live);

		let speed = BASE_SPEED,
			speedT = BASE_SPEED,
			tilt = 0,
			tiltT = 0,
			rot = 0,
			last = performance.now();
		let drag: { x: number; y: number } | null = null;
		let gyro = false;
		// Thumbnail under the mouse: the ring stops so it can be clicked, and its title shows.
		let hover: HTMLElement | null = null;
		const onOver = (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			hover = (e.target as Element).closest<HTMLElement>("a[data-a]");
			if (hover) speedT = 0;
			const c = cap.current;
			if (c) {
				c.textContent = hover ? `${hover.getAttribute("aria-label")} →` : "";
				c.style.opacity = hover ? "1" : "0";
			}
		};

		// Mouse: left/right sets the speed (and direction), up/down the tilt.
		// Touch: drag does the same; tilting the phone tilts the ring.
		const onMove = (e: PointerEvent) => {
			if (e.pointerType === "mouse") {
				if (hover) return;
				const r = el.getBoundingClientRect();
				speedT = BASE_SPEED + (((e.clientX - r.left) / r.width) * 2 - 1) * 0.6;
				tiltT = (((e.clientY - r.top) / r.height) * 2 - 1) * MAX_TILT;
			} else if (drag) {
				speedT =
					BASE_SPEED + clamp((e.clientX - drag.x) / 120, -1.5, 1.5) * 0.6;
				tiltT = clamp((e.clientY - drag.y) / 200, -1, 1) * MAX_TILT;
			}
		};
		const onDown = (e: PointerEvent) => {
			if (e.pointerType !== "mouse") drag = { x: e.clientX, y: e.clientY };
		};
		const onUp = () => {
			drag = null;
			speedT = BASE_SPEED;
			if (!gyro) tiltT = 0;
		};
		const onLeave = (e: PointerEvent) => {
			if (e.pointerType === "mouse") onUp();
		};
		const onOrient = (e: DeviceOrientationEvent) => {
			if (e.gamma == null) return;
			gyro = true;
			if (!drag) tiltT = clamp(e.gamma / 40, -1, 1) * MAX_TILT;
		};
		// iOS only reports motion after the visitor allows it, and the request must come from a tap.
		const DOE = globalThis.DeviceOrientationEvent as unknown as
			| { requestPermission?: () => Promise<string> }
			| undefined;
		const onTap = (e: MouseEvent) => {
			if ((e.target as Element).closest("a")) return; // a link tap just navigates
			DOE?.requestPermission?.().catch(() => {});
			el.removeEventListener("click", onTap);
		};
		if (DOE?.requestPermission) el.addEventListener("click", onTap);
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerover", onOver);
		el.addEventListener("pointerdown", onDown);
		el.addEventListener("pointerleave", onLeave);
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onUp);
		window.addEventListener("deviceorientation", onOrient);

		let raf = 0;
		const frame = (t: number) => {
			const dt = Math.min((t - last) / 1000, 0.05);
			last = t;
			speed += (speedT - speed) * 0.06;
			tilt += (tiltT - tilt) * 0.06;
			rot += speed * dt;
			const mobile = w < 760;
			const cx = w / 2,
				cy = h * 0.52;
			const rx = Math.min(w * (mobile ? 0.44 : 0.4), 620);
			const ry = rx * (mobile ? 0.36 : 0.28);
			const c = Math.cos(tilt),
				sn = Math.sin(tilt);
			for (const { n, a0 } of nodes) {
				const a = a0 + rot;
				const ex = rx * Math.cos(a),
					ey = ry * Math.sin(a);
				const d = (Math.sin(a) + 1) / 2;
				const x = cx + ex * c - ey * sn,
					y = cy + ex * sn + ey * c;
				const on = n === hover;
				n.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${on ? 1.1 : 0.55 + 0.45 * d})`;
				n.style.opacity = on ? "1" : String(0.35 + 0.65 * d);
				n.style.zIndex = on ? "5" : d > 0.5 ? "3" : "1";
				if (on && cap.current)
					cap.current.style.transform = `translate(${x}px, ${y + n.offsetHeight * 0.55 + 10}px) translateX(-50%)`;
			}
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			el.removeEventListener("click", onTap);
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerover", onOver);
			el.removeEventListener("pointerdown", onDown);
			el.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onUp);
			window.removeEventListener("deviceorientation", onOrient);
		};
	}, []);

	return (
		<div ref={stage} className={s.stage}>
			<h1 className={s.title}>Portfolio</h1>
			<div>
				{items.map((t, i) => {
					const a = (i / items.length) * TAU;
					return (
						// Over 12, phones show every other thumbnail (12 of 24), keeping even spacing.
						<Link
							key={t.id}
							href={t.href}
							aria-label={t.label}
							data-a={a}
							className={`${s.item} ${items.length > 12 && i % 2 ? s.extra : ""}`}
							style={place(a)}
							draggable={false}
						>
							<Image
								src={t.thumb}
								alt=""
								width={256}
								height={320}
								draggable={false}
							/>
						</Link>
					);
				})}
				{DOTS.map((d, i) => (
					<span
						key={i}
						aria-hidden
						data-a={d.a}
						className={`${s.dot} ${d.cream ? s.cream : ""}`}
						style={place(d.a)}
					/>
				))}
			</div>
			{cats.map((c, i) => (
				<Link
					key={c.href}
					href={c.href}
					className={`${s.pill} ${s[`p${i}`]}`}
					draggable={false}
				>
					{c.label}
					<sup>{c.n}</sup>
				</Link>
			))}
			<span ref={cap} className={s.cap} aria-hidden />
		</div>
	);
}
