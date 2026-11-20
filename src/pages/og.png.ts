import type { APIRoute } from "astro";
import sharp from "sharp";
import { SITE } from "../site.config";

/** Default Open Graph image, rendered at build time from an SVG template. */
export const GET: APIRoute = async ({ site }) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#312e81"/>
  <rect x="80" y="80" width="12" height="470" fill="#f59e0b"/>
  <g font-family="DejaVu Sans, Helvetica, Arial, sans-serif" fill="#ffffff">
    <text x="130" y="270" font-size="72" font-weight="700">${SITE.author}</text>
    <text x="130" y="350" font-size="44" fill="#e0e7ff">${SITE.jobTitle}</text>
    <text x="130" y="530" font-size="30" fill="#fcd34d">${site?.host ?? ""}</text>
  </g>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
