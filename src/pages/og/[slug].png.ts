import type { APIRoute, GetStaticPaths } from "astro";
import { renderOgImage } from "../../lib/og";
import { getPosts, type Post } from "../../lib/posts";
import { SITE } from "../../site.config";

/** One sharing image per post: topics, title, author and date. */
export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const { post } = props as { post: Post };
  const date = post.data.pubDate.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return renderOgImage({
    kicker: post.data.tags.map((tag) => `#${tag}`).join("  "),
    title: post.data.title,
    footer: [`${SITE.author} · ${SITE.jobTitle}`, `${date} · ${site?.host ?? ""}`],
  });
};
