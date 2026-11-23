import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import { renderOgImage } from "../lib/og";
import { SITE } from "../site.config";

/** Sharing image of the CV page. */
export const GET: APIRoute = async ({ site }) => {
  const entry = await getEntry("cv", "cv");
  if (!entry) throw new Error("Missing src/content/cv/cv.yaml");
  const { updated } = entry.data;
  const updatedLabel = updated
    ? `Updated ${updated.toLocaleDateString("en-GB", { month: "long", year: "numeric" })} · `
    : "";
  return renderOgImage({
    kicker: "CV",
    title: SITE.author,
    subtitle: `Software engineer, then DevOps, now ${SITE.jobTitle}.`,
    footer: ["Valence, France · Remote-friendly", `${updatedLabel}${site?.host ?? ""}`],
  });
};
