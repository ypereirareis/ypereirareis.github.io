import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().max(70),
    description: z.string().min(50).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
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
    skills: z.array(
      z.object({
        category: z.string(),
        items: z.array(z.string()),
      }),
    ),
    experience: z.array(
      z.object({
        company: z.string(),
        url: z.url().optional(),
        role: z.string(),
        location: z.string(),
        period,
        highlights: z.array(z.string()),
      }),
    ),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        period,
      }),
    ),
  }),
});

export const collections = { blog, cv };
