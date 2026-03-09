import { defineCollection, z } from 'astro:content';

const commonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false)
});

const blog = defineCollection({
  schema: commonSchema.extend({
    date: z.coerce.date()
  })
});

const portfolio = defineCollection({
  schema: commonSchema.extend({
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

const guides = defineCollection({
  schema: commonSchema.extend({
    guide: z.string(),
    order: z.number().int().positive()
  })
});

export const collections = { blog, portfolio, guides };
