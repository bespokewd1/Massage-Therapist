import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Every collection must reflect Decap's config.yml collection schema
// In order to be able to optimize images with Astro built-in compoments, like <Image />, we first must use this image helper
// Doc: https://docs.astro.build/en/guides/images/#images-in-content-collections

const blankToUndefined = (value: unknown) =>
  value == null || (typeof value === 'string' && value.trim() === '')
    ? undefined
    : value;

const optionalSeoText = z.preprocess(
  blankToUndefined,
  z.string().trim().optional()
);

const blogsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string(),
      date: z.date(),
      tags: z.array(z.string()),
      image: image(),
      imageAlt: z.string(),
      seo: z.preprocess(
        blankToUndefined,
        z
          .object({
            title: optionalSeoText,
            description: optionalSeoText,
            socialDescription: optionalSeoText,
            ogPhoto: z.preprocess(blankToUndefined, image().optional()),
            ogImage: z.preprocess(blankToUndefined, image().optional()),
            ogImageAlt: optionalSeoText,
          })
          .optional()
      ),
    }),
});

export const collections = {
  blog: blogsCollection,
};
