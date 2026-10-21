import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import client from '@data/client.json';
import settings from '@data/seo-pages.json';
import { cleanText, documentTitle } from './seo-text.mjs';
import {
  pagePaths,
  normalizePathname,
  isIndexablePath,
} from './seo-policy.mjs';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
// Bump this after changing the renderer's layout, crop, colors, or font treatment.
const TEMPLATE_VERSION = 1;
export type PageKey = keyof typeof pagePaths | 'global';
type PageSettings = {
  title?: string;
  description?: string;
  socialDescription?: string;
  ogPhoto?: string;
  ogImage?: string;
  ogImageAlt?: string;
};
export type SocialImage = {
  src: string;
  width: number;
  height: number;
  type: string;
  alt: string;
};
export type SeoMetadata = {
  title: string;
  description: string;
  socialTitle: string;
  socialDescription: string;
  canonical: string;
  indexable: boolean;
  type: 'website' | 'article';
  image: SocialImage;
  publishedTime?: string;
  author?: string;
};
export type OgCard = {
  key: string;
  route: string;
  headline: string;
  detail: string;
  action: string;
  photo: Buffer;
  override: boolean;
  image: SocialImage;
};

const pageCopy: Record<
  PageKey,
  { headline: string; detail: string; action: string }
> = {
  global: {
    headline: 'Massage care, your way.',
    detail: 'In-clinic and mobile massage in Edmonton.',
    action: 'Explore Stone Massage',
  },
  home: {
    headline: 'Make time to feel better.',
    detail: 'Massage therapy in Edmonton, in our clinic or in your home.',
    action: 'Find your massage',
  },
  mobileMassage: {
    headline: 'Your massage. Your space.',
    detail: 'Mobile massage in Edmonton. We bring the treatment setup to you.',
    action: 'Call to arrange your visit',
  },
  directBilling: {
    headline: 'Care with less paperwork.',
    detail:
      'Learn about direct insurance billing for your massage appointment.',
    action: 'Explore direct billing',
  },
  blog: {
    headline: 'Understand your massage care.',
    detail:
      'Practical reading on treatments, recovery, and everyday self-care.',
    action: 'Read the wellness blog',
  },
  gallery: {
    headline: 'A look inside our clinic.',
    detail: 'See the Edmonton space prepared for your next appointment.',
    action: 'Explore the gallery',
  },
  contact: {
    headline: 'Let’s plan your visit.',
    detail: `${client.address.lineOne}, ${client.address.city}, ${client.address.state} ${client.address.zip}.`,
    action: client.phoneFormatted,
  },
  giftCertificate: {
    headline: 'Give someone time to unwind.',
    detail: 'Ask Stone Massage about a massage gift certificate.',
    action: 'Contact us about a gift',
  },
  booking: {
    headline: 'Your next appointment starts here.',
    detail: 'Choose an in-clinic massage appointment in Edmonton.',
    action: 'Book with MassageBook',
  },
};

const sourceImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpeg,jpg,png,gif,webp,avif}'
);
let imagePaths: Promise<Map<string, string>> | undefined;
async function readImage(image: string | ImageMetadata) {
  let path: string | undefined;
  if (typeof image === 'string') {
    path = `/${image.replace(/^\/+/, '')}`;
    if (!sourceImages[path])
      throw new Error(`Social image must be a local source asset: ${image}`);
  } else {
    imagePaths ??= Promise.all(
      Object.entries(sourceImages).map(async ([path, load]) => {
        const { default: metadata } = await load();
        return [metadata.src, path] as const;
      })
    ).then((entries) => new Map(entries));
    path = (await imagePaths).get(image.src);
    if (!path)
      throw new Error(`Cannot locate social image source: ${image.src}`);
  }
  return readFile(resolve(process.cwd(), path.slice(1)));
}

function loadBrandAssets() {
  return Promise.all([
    readFile(
      resolve(process.cwd(), 'src/assets/fonts/open-sans-latin-400-normal.woff')
    ),
    readFile(
      resolve(process.cwd(), 'src/assets/fonts/open-sans-latin-700-normal.woff')
    ),
    readFile(resolve(process.cwd(), 'src/assets/images/logo/updated-logo.png')),
  ]).then(([regular, bold, logo]) => ({ regular, bold, logo }));
}
let brandPromise: ReturnType<typeof loadBrandAssets> | undefined;
export function getBrandAssets() {
  if (import.meta.env.DEV) return loadBrandAssets();
  return (brandPromise ??= loadBrandAssets());
}

async function makeCard(input: {
  key: string;
  route: string;
  headline: string;
  detail: string;
  action: string;
  photo: string | ImageMetadata;
  override?: string | ImageMetadata;
  alt?: string;
}): Promise<OgCard> {
  const photo = await readImage(input.override || input.photo);
  const assets = await getBrandAssets();
  const { photo: _photo, override: _override, ...text } = input;
  const hash = createHash('sha256')
    .update(String(TEMPLATE_VERSION))
    .update(String(Boolean(input.override)))
    .update(JSON.stringify(text))
    .update(client.name)
    .update(client.domain)
    .update(client.address.city)
    .update(new Uint8Array(photo))
    .update(new Uint8Array(assets.regular))
    .update(new Uint8Array(assets.bold))
    .update(new Uint8Array(assets.logo))
    .digest('hex')
    .slice(0, 12);
  return {
    ...text,
    photo,
    override: Boolean(input.override),
    image: {
      src: `/og/${input.key}-${hash}.png`,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      type: 'image/png',
      alt:
        input.alt?.trim() ||
        `${client.name}: ${cleanText(input.headline)} With massage photography in Edmonton, Alberta.`,
    },
  };
}

export function articleKey(post: CollectionEntry<'blog'>) {
  return `article-${post.id}`;
}
let cardsPromise: Promise<OgCard[]> | undefined;
export function getOgCards() {
  if (import.meta.env.DEV) cardsPromise = undefined;
  cardsPromise ??= (async () => {
    const pages = await Promise.all(
      (Object.keys(pageCopy) as PageKey[]).map((key) => {
        const page: PageSettings = settings[key] ?? {};
        return makeCard({
          key,
          route: key === 'global' ? '/' : pagePaths[key],
          ...pageCopy[key],
          photo:
            page.ogPhoto?.trim() ||
            settings.global.ogPhoto?.trim() ||
            '/src/assets/images/hero-img.jpg',
          override: page.ogImage?.trim() || undefined,
          alt: page.ogImageAlt,
        });
      })
    );
    const posts = await getCollection('blog');
    const articles = await Promise.all(
      posts.map((post) =>
        makeCard({
          key: articleKey(post),
          route: `/blog/${post.id}/`,
          headline: post.data.title,
          detail:
            'Massage knowledge and self-care from Stone Massage in Edmonton.',
          action: 'Read the article',
          photo: post.data.seo?.ogPhoto || post.data.image,
          override: post.data.seo?.ogImage,
          alt:
            post.data.seo?.ogImageAlt?.trim() ||
            `Stone Massage article card: ${post.data.title}. ${post.data.imageAlt}.`,
        })
      )
    );
    return [...pages, ...articles];
  })();
  return cardsPromise;
}
export async function getSocialImage(key: string) {
  const card = (await getOgCards()).find((entry) => entry.key === key);
  if (!card) throw new Error(`No social card configured for ${key}`);
  return card.image;
}

export async function resolveSeo(
  pathname: string,
  site: URL,
  fallback: { title?: string; description?: string } = {}
): Promise<SeoMetadata> {
  const path = normalizePathname(decodeURI(pathname));
  const pageKey = (Object.entries(pagePaths).find(
    ([, route]) => route === path
  )?.[0] || 'global') as PageKey;
  const pagination = path.match(/^\/blog\/(\d+)\/$/);
  const post =
    path.startsWith('/blog/') && !pagination
      ? (await getCollection('blog')).find(
          (entry) => `/blog/${entry.id}/` === path
        )
      : undefined;
  const page: PageSettings = settings[pagination ? 'blog' : pageKey] ?? {};
  let title = page.title?.trim() || settings.global.title;
  let description = page.description?.trim() || settings.global.description;
  let socialDescription = page.socialDescription?.trim() || description;
  let imageKey: string = pagination ? 'blog' : pageKey;
  if (post) {
    title = post.data.seo?.title?.trim() || post.data.title;
    description = post.data.seo?.description?.trim() || post.data.description;
    socialDescription = post.data.seo?.socialDescription?.trim() || description;
    imageKey = articleKey(post);
  } else if (pagination) {
    title = `${title} - Page ${pagination[1]}`;
  } else if (pageKey === 'global') {
    title = fallback.title?.trim() || title;
    if (
      fallback.description?.trim() &&
      fallback.description !== 'Meta description for the page'
    ) {
      description = fallback.description;
      socialDescription = description;
    }
  }
  return {
    title: documentTitle(title, client.name),
    description: cleanText(description),
    socialTitle: cleanText(title),
    socialDescription: cleanText(socialDescription),
    canonical: new URL(path, site).href,
    indexable: isIndexablePath(path),
    type: post ? 'article' : 'website',
    image: await getSocialImage(imageKey),
    publishedTime: post?.data.date.toISOString(),
    author: post?.data.author,
  };
}
