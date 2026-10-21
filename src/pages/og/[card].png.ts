import type { APIRoute } from 'astro';
import { getOgCards, type OgCard } from '@lib/seo';
import { renderOgImage } from '@lib/og-image';

export async function getStaticPaths() {
  return (await getOgCards()).map((card) => ({
    params: {
      card: card.image.src
        .split('/')
        .pop()!
        .replace(/\.png$/, ''),
    },
    props: { card },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const image = await renderOgImage(props.card as OgCard);
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/png' },
  });
};
