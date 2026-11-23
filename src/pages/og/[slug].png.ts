import type { APIRoute, GetStaticPaths } from "astro";
import sharp from "sharp";
import { getPosts, type Post } from "../../lib/posts";
import { SITE } from "../../site.config";

/** One Open Graph image per post (1200×630), rendered at build time from an SVG template. */
export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Greedy word wrap, measured in characters (good enough for a fixed template). */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]?.replace(/\s*\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

export const GET: APIRoute = async ({ props, site }) => {
  const { post } = props as { post: Post };
  const lines = wrap(post.data.title, 26, 3);
  const date = post.data.pubDate.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const topics = post.data.tags.map((tag) => `#${tag}`).join("   ");
  const titleTop = 300 - (lines.length - 1) * 38;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#312e81"/>
  <rect x="80" y="80" width="12" height="470" fill="#f59e0b"/>
  <g font-family="DejaVu Sans, Helvetica, Arial, sans-serif">
    <text x="130" y="128" font-size="30" fill="#fcd34d">${escapeXml(topics)}</text>
    ${lines
      .map(
        (line, index) =>
          `<text x="130" y="${titleTop + index * 76}" font-size="62" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`,
      )
      .join("\n    ")}
    <text x="130" y="500" font-size="30" fill="#e0e7ff">${escapeXml(`${SITE.author} · ${SITE.jobTitle}`)}</text>
    <text x="130" y="545" font-size="26" fill="#c7d2fe">${escapeXml(`${date} · ${site?.host ?? ""}`)}</text>
  </g>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
