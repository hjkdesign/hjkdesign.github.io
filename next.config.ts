import type { NextConfig } from "next";

// Set by the GitHub Pages workflow (e.g. "/repo-name"); empty for a custom domain or local dev.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
	// Static HTML for GitHub Pages: `next build` writes the site to out/.
	output: "export",
	// about/index.html instead of about.html next to an about/ folder, which GitHub Pages can mis-resolve.
	trailingSlash: true,
	basePath,
	env: { NEXT_PUBLIC_BASE_PATH: basePath },
	// cacheComponents / partialPrefetching are off: PPR can't run in export mode,
	// and every page here is fully prerendered anyway.
	// Display images are pre-sized by scripts/build-images.mjs; serve them as-is.
	images: { unoptimized: true },
};

export default nextConfig;
