import sharp from "sharp";

/** Open Graph images (1200×630), rendered at build time from one SVG template. */
export interface OgImage {
  /** Small amber line at the top (topics, page kind…). */
  kicker: string;
  /** Main text, wrapped automatically. */
  title: string;
  /** Optional secondary text under the title, wrapped automatically. */
  subtitle?: string | undefined;
  /** Two small lines at the bottom (author, date, domain…). */
  footer: [string, string];
}

const escapeXml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONT_FAMILY = "DejaVu Sans, Helvetica, Arial, sans-serif";
const widthCache = new Map<string, number>();

/** Rendered width of a text in pixels, measured with the same renderer and font as the image. */
async function textWidth(text: string, fontSize: number, bold: boolean): Promise<number> {
  const key = `${fontSize}|${bold}|${text}`;
  const cached = widthCache.get(key);
  if (cached !== undefined) return cached;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(text.length * fontSize * 0.9) + 20}" height="${fontSize * 2}"><text x="10" y="${fontSize * 1.4}" font-family="${FONT_FAMILY}" font-size="${fontSize}" font-weight="${bold ? 700 : 400}" fill="#000">${escapeXml(text)}</text></svg>`;
  const { info } = await sharp(Buffer.from(svg))
    .flatten({ background: "#ffffff" })
    .trim()
    .toBuffer({ resolveWithObject: true });
  widthCache.set(key, info.width);
  return info.width;
}

/**
 * Greedy word wrap on the measured pixel width; extra lines are cut with an ellipsis.
 * Each word is measured once (cached); a line is its words plus spaces (DejaVu space ≈ 0.32em),
 * with a small allowance per word for the side bearings that trimming removes.
 */
async function wrap(
  text: string,
  maxWidth: number,
  fontSize: number,
  bold: boolean,
  maxLines: number,
): Promise<string[]> {
  const space = 0.32 * fontSize;
  const bearing = 0.08 * fontSize;
  const lines: string[] = [];
  let line: string[] = [];
  let width = 0;
  for (const word of text.split(/\s+/)) {
    const wordWidth = (await textWidth(word, fontSize, bold)) + bearing;
    const candidate = line.length ? width + space + wordWidth : wordWidth;
    if (line.length && candidate > maxWidth) {
      lines.push(line.join(" "));
      line = [word];
      width = wordWidth;
    } else {
      line.push(word);
      width = candidate;
    }
  }
  if (line.length) lines.push(line.join(" "));
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]?.replace(/\s*\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

export async function renderOgImage({
  kicker,
  title,
  subtitle,
  footer,
}: OgImage): Promise<Response> {
  // Text area: from x=130 to a 70px right margin.
  const titleLines = await wrap(title, 980, 62, true, 3);
  const subtitleLines = subtitle ? await wrap(subtitle, 980, 32, false, 2) : [];
  // Center the title block (title + subtitle) between the kicker and the footer.
  const titleLineHeight = 76;
  const subtitleLineHeight = 42;
  const blockHeight =
    titleLines.length * titleLineHeight +
    (subtitleLines.length ? 20 + subtitleLines.length * subtitleLineHeight : 0);
  const areaTop = 165;
  const areaHeight = 290;
  const titleTop = Math.round(areaTop + (areaHeight - blockHeight) / 2 + 58);
  const subtitleTop =
    titleTop + (titleLines.length - 1) * titleLineHeight + 20 + subtitleLineHeight;
  const text = (x: number, y: number, size: number, fill: string, value: string, weight = 400) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(value)}</text>`;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#312e81"/>
  <rect x="80" y="80" width="12" height="470" fill="#f59e0b"/>
  <g font-family="${FONT_FAMILY}">
    ${text(130, 128, 30, "#fcd34d", kicker)}
    ${titleLines.map((line, index) => text(130, titleTop + index * titleLineHeight, 62, "#ffffff", line, 700)).join("\n    ")}
    ${subtitleLines.map((line, index) => text(130, subtitleTop + index * subtitleLineHeight, 32, "#e0e7ff", line)).join("\n    ")}
    ${text(130, 500, 30, "#e0e7ff", footer[0])}
    ${text(130, 545, 26, "#c7d2fe", footer[1])}
  </g>
</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
