import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { TOPICS } from "./site.config";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().max(130),
    description: z.string().min(20).max(300),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.enum(TOPICS)).min(1).max(2),
    draft: z.boolean().default(false),
  }),
});

const period = z.object({
  start: z.string(),
  end: z.string().optional(),
});

const cv = defineCollection({
  loader: glob({ base: "./src/content/cv", pattern: "**/*.{yaml,yml}" }),
  schema: z.object({
    headline: z.string(),
    location: z.string(),
    summary: z.string(),
    experience: z.array(
      z.object({
        company: z.string(),
        url: z.url().optional(),
        role: z.string(),
        location: z.string(),
        period,
        highlights: z.array(z.string()).default([]),
        /** Optional groups of highlights, each with a subtitle. */
        sections: z
          .array(z.object({ title: z.string(), highlights: z.array(z.string()) }))
          .default([]),
      }),
    ),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        period,
      }),
    ),
    passions: z.array(z.object({ icon: z.string(), label: z.string() })).default([]),
  }),
});

export const collections = { blog, cv };
