// The work list the CMS's "메인 궤도" picker shows (thumbnails grouped by category).
// Built with the site, so a newly added work appears there once its deploy finishes.
import { smallThumb } from "@/lib/cover";
import { chapters } from "@/lib/tracks";

export const dynamic = "force-static";

export function GET() {
	return Response.json(
		chapters.map((c) => ({
			label: c.en,
			works: c.tracks.map((t) => ({
				id: t.id,
				label: t.label,
				thumb: smallThumb(t.thumb),
			})),
		})),
	);
}
