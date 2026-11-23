import type { APIRoute } from "astro";
import { renderOgImage } from "../lib/og";
import { INTRO_POINTS, SITE } from "../site.config";

/** Default sharing image: home page, posts index and other pages. */
export const GET: APIRoute = ({ site }) =>
  renderOgImage({
    kicker: SITE.jobTitle,
    title: SITE.author,
    subtitle: INTRO_POINTS[0]?.replaceAll("**", ""),
    footer: ["GitOps · CI/CD · Kubernetes · AWS · Automation", site?.host ?? ""],
  });
