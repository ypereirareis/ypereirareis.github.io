import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Published posts, newest first. Drafts are only visible in development. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
}

export function postUrl(post: Post): string {
  return `/blog/${post.id}/`;
}
