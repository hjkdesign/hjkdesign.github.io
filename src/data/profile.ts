// Edited in the CMS (/admin) and stored in content/profile.json.
import data from "../../content/profile.json";

export const profile = {
	...data,
	// Resume PDF is uploaded in the CMS; it is copied to public/media at build time.
	resumeUrl: data.resume
		? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/media/${data.resume.split("/").pop()}`
		: "#",
};
