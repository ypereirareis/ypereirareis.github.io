import type { APIRoute } from "astro";
import sharp from "sharp";

/** 180×180 touch icon rendered at build time, same design as public/favicon.svg. */
export const GET: APIRoute = async () => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#4338ca"/>
  <rect x="10" y="10" width="12" height="12" fill="#f59e0b"/>
  <text x="32" y="48" fill="#ffffff" font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle">YP</text>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
