# SEO and social images

Stone Massage builds its metadata and social images with the site. No image service or runtime server is needed after deployment. Social crawlers receive ordinary HTML tags and static PNG files.

## Edit page metadata in the CMS

1. Open `/admin/` and choose **Site settings**, then **SEO and social sharing**.
2. Open the page you want to change. Global defaults supply missing page values.
3. Save the changes and publish through the normal Git-backed CMS workflow.
4. Review the rebuilt page and its social card before sharing the URL.

The settings live in `src/data/seo-pages.json`. These fields are available for global defaults and the eight main pages.

| CMS field | JSON key | What it changes |
| --- | --- | --- |
| SEO title | `title` | The document title and social title. The document title appends a pipe and `Stone Massage`, except when the title is exactly `Stone Massage` or already ends with that suffix. Omit the brand when editing. |
| SEO description | `description` | The search description and the default social description. |
| Social description | `socialDescription` | Only the Open Graph and Twitter descriptions. Leave blank to use the SEO description. |
| Photo for generated social card | `ogPhoto` | The photo inside the branded card. Use a clean photo without text. |
| Complete social image override | `ogImage` | A finished card that replaces the generated composition. Leave blank to generate the card. |
| Social image alt text | `ogImageAlt` | The description read when someone cannot see the social image. |

These settings change metadata, not the visible page heading or body. Generated main-page card headlines and action text are maintained in `src/lib/seo.ts`; changing an SEO title does not rewrite that image copy.

Page titles and descriptions fall back to the global values when blank. A blank page photo uses the global photo. A blank complete override means generate a branded card, not inherit a different page's finished card. Without custom image alt text, the generator supplies a description of the branded card.

## Edit article metadata

Open an article in **Blog**, then expand **SEO and social sharing**. Every field in this section is optional.

- `seo.title` replaces the article title in metadata. It does not change the article heading or the title printed on the generated card.
- `seo.description` replaces the article description in metadata.
- `seo.socialDescription` gives social previews a shorter description without shortening the search description.
- `seo.ogPhoto` uses a different photo in the generated card. This is useful when the featured image contains text. It does not change the featured image on the article or listing.
- `seo.ogImage` replaces the whole social card with a finished image.
- `seo.ogImageAlt` describes the resulting social image. Set this when a custom photo or finished card differs from the featured image.

With no overrides, metadata uses the article's `title` and `description`, and the card uses its featured `image`. Social descriptions fall back to the resolved SEO description. Default article alt text includes the article title and `imageAlt`. An empty SEO object or blank optional fields have the same effect as leaving the section unset.

The publication time comes from the article's existing `date`. The author meta tag uses its existing `author` exactly. Fix the article frontmatter if either value is wrong; do not invent dates or author names in a layout.

For a direct Markdown edit, the optional block looks like this:

```yaml
seo:
  title: Mobile Massage in Edmonton
  description: Learn what to expect from an in-home massage appointment with Stone Massage in Edmonton.
  socialDescription: A massage appointment in your own space. Here is how it works.
  ogPhoto: /src/assets/images/og/mobile-massage-photo.jpg
  ogImageAlt: A prepared massage table in a client's bright living room
```

Use an existing local image path or upload the image first. The example path is not a bundled asset.

## Choose and review images

New social uploads go in `src/assets/images/og/`. Existing files under `src/assets/images/` can also be selected. Remote image URLs are not supported, even if the CMS image picker accepts a URL-shaped value. Enter a local `/src/assets/images/...` path instead.

Generated cards crop the photo to fill the right-hand image panel. Keep faces and important details away from the photo edges. Avoid screenshots and text-heavy photos; the card already has a headline, logo, location, and action line.

A complete override should be a finished **1200 x 630** image with readable text, Stone Massage branding, and any action line it needs. The build does not add these elements to a complete override. It converts the image to PNG and fits it within 1200 x 630 without cropping, adding a background if the aspect ratio differs. Aim below 2 MiB per output card.

Review cards at full size and at the small size used in a message preview. Check the crop, contrast, line breaks, spelling, and full article title. A generated card should have a useful action line, but a CTA is an editorial choice, not a required Open Graph protocol field.

## Preview and verify locally

Start the development server:

```sh
npm run dev
```

Open `http://localhost:4321/dev/og/` to see all cards and open their full-size PNGs. The page exists only during development. It is not emitted into `dist/` and is not a public production gallery. The CMS runs at `http://localhost:4321/admin/` while the local Decap server is running.

Then check the production output:

```sh
npm run build
npm run check:seo
npm run test:seo
npm run preview
```

`check:seo` reads the existing `dist/` directory. Always rebuild after changing content, metadata, source images, or renderer code. A check against an old build does not verify new changes.

The checker needs no additional dependencies. It checks every built HTML route, with explicit exceptions for the CMS entry page and the static booking redirect. It verifies single normalized titles and descriptions, canonicals, Open Graph and Twitter fields, article dates and authors against source content, blog links, pagination, sitemap coverage, and PNG signatures and dimensions. Main pages and articles must have distinct image URLs. Blog pagination intentionally shares the listing image.

Title length, description length, and the 2 MiB image goal produce warnings for review. They are soft targets, not protocol limits. A long, accurate article title is better than one cut off just to satisfy a character count. Placeholder descriptions, missing files, invalid URLs, and incomplete metadata fail the check. The tests cover the shared route policy without starting Astro or building images.

Use `npm run preview` to inspect the built pages and PNG files, not the development-only card gallery. Metadata still points to the production domain during local preview. View the HTML source or inspect the files in `dist/` rather than expecting an external social crawler to reach localhost.

## Routes, canonicals, and indexing

The production origin is `https://stonemassage.ca`. Canonical URLs and `og:url` agree, use HTTPS, omit query strings and fragments, and end in a slash.

| Page key | Public route |
| --- | --- |
| `home` | `/` |
| `mobileMassage` | `/mobile-massage/` |
| `directBilling` | `/direct-billing/` |
| `blog` | `/blog/` |
| `gallery` | `/gallery/` |
| `contact` | `/contact/` |
| `giftCertificate` | `/giftcertificate/` |
| `booking` | `/booking/` |

Blog listings use two posts per page. `/blog/2/` and later pages have their own canonical URL and a `Page N` title. Articles use `og:type=article`; listings and other pages use `website`. Article IDs come from Astro's content loader, which can normalize punctuation in filenames. Use the generated article links instead of constructing URLs from raw Markdown filenames.

`src/lib/seo-policy.mjs` is the shared source for main routes and indexability. The sitemap filter and metadata resolver both use it. These legacy routes remain available but use `noindex, follow` and stay out of the sitemap:

- `/about/` and `/reviews/`
- `/projects/`, `/projects/project-1/`, and `/projects/project-2/`
- `/gallery/inside/`, `/gallery/client/`, and `/gallery/events/`

Fallback pages can use the shared global card. `/admin/` also has `noindex` and is excluded from the sitemap. Generated image routes stay out of the sitemap. The development preview is not built in production.

`robots.txt` allows crawlers to fetch pages. Do not add a `Disallow` rule for a page whose `noindex` meta tag a crawler needs to read. `noindex` requests search-result exclusion; it is not access control and does not guarantee immediate removal from a search engine. Admin authentication remains a separate concern.

`/book` is the old URL. `astro.config.mjs` declares a permanent redirect to `/booking/`, and `public/_redirects` supplies the HTTP 301 rule for hosts that support that file. A plain static host can only serve Astro's generated refresh HTML, with a destination canonical and `noindex`. That fallback is not an HTTP 301 response. Check the deployed response and configure an equivalent redirect if the host ignores `_redirects`. The redirect page does not need the full social metadata set.

## How generation works

- `src/lib/seo.ts` resolves page and article metadata and describes the cards.
- `src/lib/seo-text.mjs` normalizes text and applies the document-title suffix.
- `src/components/SeoHead.astro` writes the shared HTML tags.
- `src/lib/og-image.tsx` uses local fonts, Satori, and Sharp to render PNGs.
- `src/pages/og/[card].png.ts` emits static `/og/<key>-<12-character-hash>.png` files.
- `src/data/seo-pages.json`, article frontmatter, and `public/admin/config.yml` hold the editable settings and CMS fields.

The build generates one global card, one for each main page, and one for each article. With eight main pages and eleven articles, that is twenty PNGs. Pagination does not add cards. The output always uses 1200 x 630 PNGs, and metadata gives the absolute image URL, dimensions, media type, and alt text. Twitter uses `summary_large_image` with the same social title, description, image, and alt text as Open Graph.

Fingerprints include the rendered card inputs, source image bytes, local brand assets, and the template version. Replacing photo bytes at the same source path still creates a new image URL. Metadata-only changes that do not affect the card can keep the same URL. Bump `TEMPLATE_VERSION` in `src/lib/seo.ts` after changing renderer layout, crop, colours, or font treatment.

To add a main page, add its route to `pagePaths`, its editable record to `seo-pages.json`, its card copy to `seo.ts`, and its CMS fields to `config.yml`. Update the route policy if the page should not be indexed. Do not add a second metadata block to the layout or page; use the resolver.

## Deploy and refresh social previews

Publish through the existing Git workflow. CMS changes create repository commits, and the normal host build regenerates the HTML and PNGs. Deploy the whole fresh `dist/` output so that each metadata image URL has its matching file. No separate image upload service is involved.

After deployment, open a page's canonical URL and its `og:image` URL directly. Confirm that the image returns successfully with `Content-Type: image/png`. Run the page through the social platform's sharing debugger or inspection tool and request a new scrape. Image fingerprints avoid stale image URLs when card content changes, but platforms can still cache the page metadata. A successful deploy does not immediately refresh every existing shared post.

Do not change canonical URLs or append tracking parameters just to force a new preview. Request a rescan first, and allow for the platform's cache delay. Recheck `/book` on the deployed host as well; local static preview cannot prove that the host applies the HTTP redirect rule.
