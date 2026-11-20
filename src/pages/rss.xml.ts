import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts, postUrl } from "../lib/posts";
import { SITE } from "../site.config";

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  return rss({
    title: `${SITE.title} · Posts`,
    description: SITE.description,
    site: site ?? SITE.links.github,
    customData: `<language>${SITE.lang}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: postUrl(post),
    })),
  });
};
