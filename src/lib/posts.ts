import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Latest posts listed on the home page. */
export const HOME_POSTS = 5;

/** Latest posts listed on the posts index; older ones go to the "Archived" section. */
export const BLOG_LATEST_POSTS = 10;

/** Published posts, newest first. Drafts are only visible in development. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}
