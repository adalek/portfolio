import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    category: z.enum(['Technical Art', 'Game', 'Creative Coding', 'Visual Art', 'Sound', 'Archive']),
    summary: z.string(),
    role: z.array(z.string()),
    tools: z.array(z.string()),
    cover: z.string(),
    background: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(999),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .default([]),
    media: z
      .array(
        z.object({
          type: z.enum(['image', 'video', 'pdf']),
          src: z.string(),
          caption: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
