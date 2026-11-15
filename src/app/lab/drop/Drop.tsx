"use client";

import type MatterJS from "matter-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LabCat, LabItem } from "@/lib/lab";
import s from "./drop.module.css";

type Matter = typeof MatterJS;
type Sim = { stop: () => void; setHeight: (h: number) => void };

const STEP = 1000 / 60; // fixed physics step, so 120 Hz screens don't run double speed
const WALL = 400; // thick walls: fast throws can't tunnel through

/** Runs the pile in `el`: drops every [data-body] element, syncs DOM transforms to the bodies. */
function simulate(M: Matter, el: HTMLElement, go: (href: string) => void): Sim {
	const {
		Engine,
		Bodies,
		Body,
		Composite,
		Mouse,
		MouseConstraint,
		Query,
		Sleeping,
	} = M;
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const W = el.clientWidth;
	let H = el.clientHeight;
	const engine = Engine.create({ enableSleeping: true });
	const floor = Bodies.rectangle(W / 2, H + WALL / 2, W * 3, WALL, {
		isStatic: true,
	});
	Composite.add(engine.world, [
		floor,
		Bodies.rectangle(-WALL / 2, 0, WALL, H * 6, { isStatic: true }),
		Bodies.rectangle(W + WALL / 2, 0, WALL, H * 6, { isStatic: true }),
	]);

	el.classList.add(s.live);
	// Hidden ones (phone extras) get no body.
	const nodes = [...el.querySelectorAll<HTMLElement>("[data-body]")].filter(
		(n) => n.offsetParent !== null,
	);
	const parts = nodes
		.map((n) => {
			const w = n.offsetWidth,
				h = n.offsetHeight;
			const body = Bodies.rectangle(
				w / 2 + Math.random() * Math.max(1, W - w),
				-h,
				w,
				h,
				{
					chamfer: {
						radius:
							n.dataset.body === "img" ? Math.min(12, h / 2 - 1) : h / 2 - 0.5,
					},
					restitution: 0.3,
					friction: 0.5,
					frictionAir: 0.015,
					density: 0.002,
					angle: (Math.random() - 0.5) * 0.8,
				},
			);
			n.style.visibility = "hidden";
			return { n, w, h, body, href: n.dataset.go ?? "", added: false };
		})
		.sort(() => Math.random() - 0.5); // drop order

	const sync = () => {
		for (const p of parts) {
			if (!p.added) continue;
			const { x, y } = p.body.position;
			if (y > H + 300 || x < -300 || x > W + 300) {
				// Escaped somehow: drop it back in.
				Body.setPosition(p.body, { x: W / 2, y: -p.h });
				Body.setVelocity(p.body, { x: 0, y: 0 });
			}
			p.n.style.transform = `translate(${x - p.w / 2}px, ${y - p.h / 2}px) rotate(${p.body.angle}rad)`;
		}
	};
	const add = (p: (typeof parts)[number]) => {
		Composite.add(engine.world, p.body);
		p.added = true;
		p.n.style.visibility = "visible";
	};

	// Tap = short press without moving → open the link. (Matter swallows touch clicks, and a
	// throw that ends over a tag must not count as a click.) Keyboard Enter keeps the normal link.
	let down: { x: number; y: number; t: number; href: string } | null = null;
	const onDown = (e: PointerEvent) => {
		const r = el.getBoundingClientRect();
		const live = parts.filter((p) => p.added);
		const hit = Query.point(
			live.map((p) => p.body),
			{ x: e.clientX - r.left, y: e.clientY - r.top },
		)[0];
		down = {
			x: e.clientX,
			y: e.clientY,
			t: performance.now(),
			href: live.find((p) => p.body === hit)?.href ?? "",
		};
	};
	const onUp = (e: PointerEvent) => {
		if (
			down?.href &&
			Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8 &&
			performance.now() - down.t < 400
		)
			go(down.href);
		down = null;
	};
	const onClick = (e: MouseEvent) => {
		if (e.detail !== 0) e.preventDefault();
	};
	el.addEventListener("pointerdown", onDown);
	window.addEventListener("pointerup", onUp);
	el.addEventListener("click", onClick);

	const timers: number[] = [];
	let raf = 0;
	let mouse: MatterJS.Mouse | null = null;
	if (reduce) {
		// No motion: settle the pile off-screen and show it already stacked.
		parts.forEach((p, i) => {
			Body.setPosition(p.body, { x: p.body.position.x, y: -p.h - i * p.h });
			add(p);
		});
		for (let i = 0; i < 900; i++) Engine.update(engine, STEP);
		sync();
	} else {
		mouse = Mouse.create(el);
		// Don't let the stage swallow wheel scrolling.
		const m = mouse as unknown as {
			element: HTMLElement;
			mousewheel: EventListener;
		};
		for (const ev of ["wheel", "mousewheel", "DOMMouseScroll"])
			m.element.removeEventListener(ev, m.mousewheel);
		Composite.add(
			engine.world,
			MouseConstraint.create(engine, {
				mouse,
				constraint: { stiffness: 0.2, damping: 0.1 },
			}),
		);
		parts.forEach((p, i) =>
			timers.push(window.setTimeout(() => add(p), 300 + i * 90)),
		);
		let last = performance.now(),
			acc = 0;
		const tick = (t: number) => {
			acc = Math.min(acc + t - last, 100);
			last = t;
			while (acc >= STEP) {
				Engine.update(engine, STEP);
				acc -= STEP;
			}
			sync();
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}

	return {
		setHeight(h) {
			// Phone address bar showing/hiding: move the floor, don't re-drop.
			H = h;
			Body.setPosition(floor, { x: W / 2, y: H + WALL / 2 });
			for (const p of parts) Sleeping.set(p.body, false);
			if (reduce) {
				for (let i = 0; i < 300; i++) Engine.update(engine, STEP);
				sync();
			}
		},
		stop() {
			cancelAnimationFrame(raf);
			timers.forEach(clearTimeout);
			el.removeEventListener("pointerdown", onDown);
			window.removeEventListener("pointerup", onUp);
			el.removeEventListener("click", onClick);
			if (mouse) {
				// Matter has no API to detach its listeners.
				const m = mouse as unknown as Record<string, EventListener> & {
					element: HTMLElement;
				};
				for (const [ev, fn] of [
					["mousemove", "mousemove"],
					["mousedown", "mousedown"],
					["mouseup", "mouseup"],
					["touchmove", "mousemove"],
					["touchstart", "mousedown"],
					["touchend", "mouseup"],
				])
					m.element.removeEventListener(ev, m[fn]);
			}
			Composite.clear(engine.world, false);
			Engine.clear(engine);
		},
	};
}

/** Prototype B: category tags, work titles and thumbnails drop and pile up; drag to throw, tap to open. */
export function Drop({
	cats,
	titles,
	thumbs,
}: {
	cats: LabCat[];
	titles: LabItem[];
	thumbs: LabItem[];
}) {
	const stage = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useEffect(() => {
		const el = stage.current;
		if (!el) return;
		let alive = true;
		let M: Matter | null = null;
		let sim: Sim | null = null;
		let width = 0,
			height = 0;
		const run = () => {
			sim?.stop();
			width = el.clientWidth;
			height = el.clientHeight;
			sim = simulate(M!, el, (href) => router.push(href));
		};
		const ro = new ResizeObserver(() => {
			if (!M) return;
			if (el.clientWidth !== width)
				run(); // rotation / window resize: drop again
			else if (el.clientHeight !== height)
				sim?.setHeight((height = el.clientHeight));
		});
		(async () => {
			// Loaded after the first paint, so the title shows as fast as the current cover.
			const mod = (await import("matter-js")).default;
			await document.fonts.ready;
			if (!alive) return;
			M = mod;
			run();
			ro.observe(el);
		})();
		return () => {
			alive = false;
			ro.disconnect();
			sim?.stop();
		};
	}, [router]);

	return (
		<div ref={stage} className={s.stage}>
			<div className={s.head}>
				<h1 className={s.title}>Portfolio</h1>
				<p className={s.role}>Graphic designer</p>
			</div>
			<p className={s.hint}>
				<span className={s.desk}>
					들어오면 위에서 떨어져 쌓여요 · 잡아서 던질 수 있어요 · 톡 누르면 이동
				</span>
				<span className={s.mob}>손가락으로 던져 보세요 · 톡 누르면 이동</span>
			</p>
			<div className={s.pile}>
				{cats.map((c) => (
					<Link
						key={c.href}
						href={c.href}
						data-body="pill"
						data-go={c.href}
						className={`${s.body} ${s.cat}`}
						draggable={false}
					>
						{c.label}
						<sup>{c.n}</sup>
					</Link>
				))}
				{/* Phones get fewer: 2 titles and 5 thumbnails. */}
				{titles.map((t, i) => (
					<Link
						key={t.id}
						href={t.href}
						data-body="pill"
						data-go={t.href}
						className={`${s.body} ${s.tl} ${i >= 2 ? s.extra : ""}`}
						draggable={false}
					>
						{t.label}
					</Link>
				))}
				{thumbs.map((t, i) => (
					<Link
						key={t.id}
						href={t.href}
						data-body="img"
						data-go={t.href}
						aria-label={t.label}
						className={`${s.body} ${s.th} ${i >= 5 ? s.extra : ""}`}
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
				))}
			</div>
		</div>
	);
}
