import type { APIRoute } from "astro";
import sharp from "sharp";

/** 180×180 touch icon derived from the avatar at build time. */
export const GET: APIRoute = async () => {
  const png = await sharp("src/assets/avatar.jpg").resize(180, 180).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
