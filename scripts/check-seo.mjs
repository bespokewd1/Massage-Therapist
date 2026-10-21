import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isIndexablePath,
  normalizePathname,
  noindexPaths,
  pagePaths,
} from '../src/lib/seo-policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const site = 'https://stonemassage.ca';
const errors = [];
const warnings = [];
const imageReferences = new Set();
const uniqueImages = new Map();
const metadata = new Map();
const cleanText = (text) => text.replace(/\s+/g, ' ').trim();
const placeholder =
  /lorem ipsum|meta description for the page|yourwebsite\.com|^page title$|^(?:undefined|null)$/i;

function check(condition, label, message) {
  if (!condition) errors.push(`${label}: ${message}`);
  return condition;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    })
  );
  return nested.flat();
}

function decodeHtml(text) {
  const entities = {
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
    nbsp: ' ',
    ndash: '\u2013',
    mdash: '\u2014',
    lsquo: '\u2018',
    rsquo: '\u2019',
    ldquo: '\u201c',
    rdquo: '\u201d',
    hellip: '\u2026',
  };
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith('#')) {
      const code =
        entity[1].toLowerCase() === 'x'
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return entities[entity.toLowerCase()] ?? match;
  });
}

function attributes(text) {
  const result = {};
  for (const match of text.matchAll(
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  )) {
    result[match[1].toLowerCase()] = decodeHtml(
      match[2] ?? match[3] ?? match[4] ?? ''
    );
  }
  return result;
}

function tags(html, name) {
  const matches = html.matchAll(
    new RegExp(`<${name}\\b((?:"[^"]*"|'[^']*'|[^'">])*)>`, 'gi')
  );
  return [...matches].map((match) => attributes(match[1]));
}

function documentHead(html) {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
  return (
    withoutComments.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ??
    withoutComments
  ).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

function oneMeta(metas, attribute, key, label) {
  const found = metas.filter((tag) => tag[attribute]?.toLowerCase() === key);
  check(
    found.length === 1,
    label,
    `expected one ${key} meta tag, found ${found.length}`
  );
  return found[0]?.content ?? '';
}

function meaningful(text, label, field, minimum = 1) {
  check(
    text.length >= minimum && !placeholder.test(text),
    label,
    `${field} must contain meaningful text`
  );
  check(
    text === cleanText(text),
    label,
    `${field} must have normalized whitespace`
  );
}

function routeFromFile(file) {
  let path = relative(dist, file).split(sep).join('/');
  path = path.replace(/(?:^|\/)index\.html$/, '/').replace(/\.html$/, '');
  return normalizePathname(path);
}

function requireUniqueImage(route, image) {
  const previous = uniqueImages.get(image);
  check(!previous, route, `social image must be distinct from ${previous}`);
  uniqueImages.set(image, route);
}

// Read only the text fields needed to compare generated article metadata with its source.
// Decap writes quoted scalars or indented continuation lines for these fields.
function frontmatterValue(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (index < 0) return '';
  let value = lines[index].slice(key.length + 1).trim();
  const continuation = [];
  for (
    let line = index + 1;
    line < lines.length && /^\s+\S/.test(lines[line]);
    line++
  ) {
    continuation.push(lines[line].trim());
  }
  if (/^[>|][-+]?\d?$/.test(value)) value = continuation.join(' ');
  else if (continuation.length) value = [value, ...continuation].join(' ');
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      /* YAML also allows multiline quoted scalars. */
    }
  }
  if (value.startsWith("'") && value.endsWith("'"))
    return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

async function sourceArticles() {
  const files = await walk(join(root, 'src', 'content', 'blog'));
  return Promise.all(
    files
      .filter((file) => /\.mdx?$/.test(file) && !basename(file).startsWith('_'))
      .map(async (file) => {
        const text = await readFile(file, 'utf8');
        const frontmatter =
          text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
        const date = new Date(frontmatterValue(frontmatter, 'date'));
        const label = relative(root, file);
        check(
          Number.isFinite(date.valueOf()),
          label,
          'source article must have a valid publication date'
        );
        return {
          file,
          title: cleanText(frontmatterValue(frontmatter, 'title')),
          author: cleanText(frontmatterValue(frontmatter, 'author')),
          published: Number.isFinite(date.valueOf()) ? date.toISOString() : '',
        };
      })
  );
}

function validateRedirect(head, route) {
  const metas = tags(head, 'meta');
  const refresh = oneMeta(metas, 'http-equiv', 'refresh', route);
  const destination = refresh
    .match(/^0\s*;\s*url\s*=\s*(.+)$/i)?.[1]
    ?.replace(/^["']|["']$/g, '');
  check(
    Boolean(destination) &&
      new URL(destination, site).href === `${site}/booking/`,
    route,
    'static redirect must immediately refresh to /booking/'
  );
  const canonicals = tags(head, 'link').filter((tag) =>
    tag.rel?.toLowerCase().split(/\s+/).includes('canonical')
  );
  check(
    canonicals.length === 1 &&
      new URL(canonicals[0]?.href || '/', site).href === `${site}/booking/`,
    route,
    'redirect canonical must point to /booking/'
  );
  check(
    oneMeta(metas, 'name', 'robots', route)
      .toLowerCase()
      .split(/[\s,]+/)
      .includes('noindex'),
    route,
    'static redirect must be noindex'
  );
}

async function validatePage(file, route, articles, matchedSources) {
  const html = await readFile(file, 'utf8');
  const head = documentHead(html);
  if (route === '/book/') {
    validateRedirect(head, route);
    return;
  }
  const metas = tags(head, 'meta');
  const robotTags = metas.filter((tag) => tag.name?.toLowerCase() === 'robots');
  check(robotTags.length <= 1, route, 'robots meta must not be duplicated');
  const robots = (robotTags[0]?.content ?? '').toLowerCase().split(/[\s,]+/);
  if (!isIndexablePath(route)) {
    check(
      robots.includes('noindex'),
      route,
      'excluded routes must have a noindex meta tag'
    );
    if (noindexPaths.includes(route)) {
      check(
        robots.includes('follow') && !robots.includes('nofollow'),
        route,
        'legacy routes must use noindex, follow'
      );
    }
  } else {
    check(
      !robots.includes('noindex') && !robots.includes('nofollow'),
      route,
      'public route must be indexable and followable'
    );
  }
  if (/^\/admin(?:\/|$)/.test(route)) return;
  check(
    !/^\/dev(?:\/|$)/.test(route),
    route,
    'development previews must not be built'
  );

  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  check(
    titles.length === 1,
    route,
    `expected one title, found ${titles.length}`
  );
  const title = decodeHtml(titles[0]?.[1] ?? '');
  meaningful(title, route, 'title');
  check(
    title.includes('Stone Massage'),
    route,
    'title must identify Stone Massage'
  );
  const description = oneMeta(metas, 'name', 'description', route);
  meaningful(description, route, 'description', 30);
  if (title.length > 65)
    warnings.push(
      `${route}: title is ${title.length} characters; review search-result truncation`
    );
  if (description.length < 120 || description.length > 170) {
    warnings.push(
      `${route}: description is ${description.length} characters; aim for roughly 120-170 when the copy allows`
    );
  }
  const canonicals = tags(head, 'link').filter((tag) =>
    tag.rel?.toLowerCase().split(/\s+/).includes('canonical')
  );
  check(
    canonicals.length === 1,
    route,
    `expected one canonical link, found ${canonicals.length}`
  );
  const canonical = canonicals[0]?.href ?? '';
  check(
    canonical === new URL(route, site).href,
    route,
    'canonical must be the absolute, self-referencing HTTPS URL with a trailing slash'
  );
  check(
    oneMeta(metas, 'property', 'og:url', route) === canonical,
    route,
    'og:url must match the canonical'
  );
  check(
    oneMeta(metas, 'property', 'og:site_name', route) === 'Stone Massage',
    route,
    'og:site_name must be Stone Massage'
  );
  check(
    oneMeta(metas, 'property', 'og:locale', route) === 'en_CA',
    route,
    'og:locale must be en_CA'
  );
  const isArticle =
    /^\/blog\/[^/]+\/$/.test(route) && !/^\/blog\/\d+\/$/.test(route);
  check(
    oneMeta(metas, 'property', 'og:type', route) ===
      (isArticle ? 'article' : 'website'),
    route,
    'og:type does not match the route'
  );
  const socialTitle = oneMeta(metas, 'property', 'og:title', route);
  const socialDescription = oneMeta(metas, 'property', 'og:description', route);
  meaningful(socialTitle, route, 'og:title');
  meaningful(socialDescription, route, 'og:description', 20);
  if (socialDescription.length > 200)
    warnings.push(
      `${route}: social description is ${socialDescription.length} characters; consider a shorter socialDescription override`
    );

  const image = oneMeta(metas, 'property', 'og:image', route);
  let imageUrl;
  try {
    imageUrl = new URL(image);
  } catch {
    /* Report the invalid URL below. */
  }
  const validImage =
    imageUrl?.origin === site &&
    !imageUrl.search &&
    !imageUrl.hash &&
    /^\/og\/[a-z\d-]+-[a-f\d]{12}\.png$/i.test(imageUrl.pathname);
  check(
    validImage,
    route,
    'og:image must be an absolute, fingerprinted /og/*.png URL on the production domain'
  );
  if (validImage) imageReferences.add(decodeURI(imageUrl.pathname));
  check(
    oneMeta(metas, 'property', 'og:image:secure_url', route) === image,
    route,
    'og:image:secure_url must match og:image'
  );
  for (const [key, expected] of [
    ['width', '1200'],
    ['height', '630'],
    ['type', 'image/png'],
  ]) {
    check(
      oneMeta(metas, 'property', `og:image:${key}`, route) === expected,
      route,
      `og:image:${key} must be ${expected}`
    );
  }
  const alt = oneMeta(metas, 'property', 'og:image:alt', route);
  meaningful(alt, route, 'og:image:alt');
  check(
    oneMeta(metas, 'name', 'twitter:card', route) === 'summary_large_image',
    route,
    'twitter:card must be summary_large_image'
  );
  for (const [key, expected] of [
    ['title', socialTitle],
    ['description', socialDescription],
    ['image', image],
    ['image:alt', alt],
  ]) {
    check(
      oneMeta(metas, 'name', `twitter:${key}`, route) === expected,
      route,
      `twitter:${key} must match Open Graph`
    );
  }
  if (Object.values(pagePaths).includes(route) || isArticle)
    requireUniqueImage(route, image);
  metadata.set(route, { title, image, html });

  if (isArticle) {
    const published = oneMeta(
      metas,
      'property',
      'article:published_time',
      route
    );
    const author = oneMeta(metas, 'name', 'author', route);
    meaningful(author, route, 'author');
    const articleHeading = [
      ...html.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi),
    ].find((match) =>
      attributes(match[1]).class?.split(/\s+/).includes('blog-h1')
    );
    const heading = cleanText(
      decodeHtml((articleHeading?.[2] ?? '').replace(/<[^>]+>/g, ''))
    );
    const source = articles.find(
      (entry) =>
        !matchedSources.has(entry.file) &&
        entry.title === heading &&
        entry.published === published &&
        entry.author === author
    );
    check(
      Boolean(source),
      route,
      'article heading, publication time, and author must match one source post'
    );
    if (source) matchedSources.add(source.file);
  } else {
    check(
      !metas.some(
        (tag) => tag.property?.toLowerCase() === 'article:published_time'
      ),
      route,
      'website pages must not claim an article publication time'
    );
  }
}

async function validateImages(files, articleCount) {
  const images = files.filter(
    (file) =>
      relative(dist, file).split(sep)[0] === 'og' && /\.png$/i.test(file)
  );
  check(
    images.length === Object.keys(pagePaths).length + 1 + articleCount,
    '/og/',
    `expected one global card, ${Object.keys(pagePaths).length} page cards, and ${articleCount} article cards; found ${images.length}`
  );
  const imagePaths = new Set();
  for (const file of images) {
    const path = `/${relative(dist, file).split(sep).join('/')}`;
    imagePaths.add(path);
    check(
      /^\/og\/[a-z\d-]+-[a-f\d]{12}\.png$/i.test(path),
      path,
      'filename must contain a 12-character content fingerprint'
    );
    const png = await readFile(file);
    const validPng =
      png.length >= 24 &&
      png
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
      png.toString('ascii', 12, 16) === 'IHDR';
    check(validPng, path, 'file must be a PNG with an IHDR header');
    if (validPng)
      check(
        png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630,
        path,
        'actual PNG dimensions must be 1200 x 630'
      );
    if (png.length >= 2 * 1024 * 1024)
      warnings.push(
        `${path}: ${(png.length / 1024 / 1024).toFixed(2)} MiB; aim below 2 MiB`
      );
  }
  for (const image of imageReferences)
    check(imagePaths.has(image), image, 'metadata references a missing PNG');
  return images.length;
}

function validateListings(routes) {
  const listings = [...metadata.keys()].filter(
    (route) => route === '/blog/' || /^\/blog\/\d+\/$/.test(route)
  );
  const articles = [...metadata.keys()].filter(
    (route) => /^\/blog\/[^/]+\/$/.test(route) && !/^\/blog\/\d+\/$/.test(route)
  );
  const listedArticles = new Set();
  const titles = new Set();
  for (let page = 1; page <= listings.length; page++) {
    const route = page === 1 ? '/blog/' : `/blog/${page}/`;
    const entry = metadata.get(route);
    check(Boolean(entry), '/blog/', `pagination is missing ${route}`);
    if (!entry) continue;
    check(
      !titles.has(entry.title),
      route,
      'each blog listing page must have a distinct title'
    );
    titles.add(entry.title);
    if (page > 1) {
      check(
        entry.title.includes(` - Page ${page} | Stone Massage`),
        route,
        'pagination title must identify its page number'
      );
      check(
        entry.image === metadata.get('/blog/')?.image,
        route,
        'pagination must reuse the blog listing card'
      );
    }
    for (const anchor of tags(
      entry.html.replace(/<!--[\s\S]*?-->/g, ''),
      'a'
    )) {
      if (!anchor.href) continue;
      let link;
      try {
        link = new URL(anchor.href, new URL(route, site));
      } catch {
        continue;
      }
      if (link.origin !== site || !link.pathname.startsWith('/blog/')) continue;
      const target = normalizePathname(decodeURI(link.pathname));
      check(
        routes.has(target),
        route,
        `internal blog link does not resolve: ${anchor.href}`
      );
      if (articles.includes(target)) listedArticles.add(target);
    }
  }
  for (const route of articles)
    check(
      listedArticles.has(route),
      '/blog/',
      `article is not linked from a blog listing: ${route}`
    );
}

async function validateSitemaps(files, routes) {
  const sitemaps = files.filter((file) =>
    /^sitemap.*\.xml$/i.test(basename(file))
  );
  check(
    sitemaps.some((file) => basename(file) === 'sitemap-index.xml'),
    'sitemap',
    'sitemap-index.xml is missing'
  );
  const sitemapPaths = new Set(
    sitemaps.map((file) => `/${relative(dist, file).split(sep).join('/')}`)
  );
  const listed = new Set();
  for (const file of sitemaps) {
    const xml = await readFile(file, 'utf8');
    const isIndex = /<sitemapindex\b/.test(xml);
    for (const match of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)) {
      const value = decodeHtml(match[1].trim());
      let url;
      try {
        url = new URL(value);
      } catch {
        /* Report the invalid URL below. */
      }
      if (
        !check(
          url?.origin === site && !url.search && !url.hash,
          basename(file),
          `invalid production URL: ${value}`
        )
      )
        continue;
      if (isIndex) {
        check(
          sitemapPaths.has(decodeURI(url.pathname)),
          basename(file),
          `referenced sitemap does not exist: ${value}`
        );
        continue;
      }
      const route = normalizePathname(decodeURI(url.pathname));
      check(
        value === new URL(route, site).href,
        basename(file),
        `URL must have normalized path and trailing slash: ${value}`
      );
      check(
        isIndexablePath(route),
        basename(file),
        `excluded route is in the sitemap: ${route}`
      );
      check(
        routes.has(route),
        basename(file),
        `sitemap route has no built HTML: ${route}`
      );
      check(
        !listed.has(route),
        basename(file),
        `duplicate sitemap route: ${route}`
      );
      listed.add(route);
    }
  }
  for (const route of routes.keys()) {
    if (isIndexablePath(route))
      check(
        listed.has(route),
        'sitemap',
        `indexable HTML route is missing: ${route}`
      );
  }
}

async function validateRobots() {
  const text = await readFile(join(dist, 'robots.txt'), 'utf8');
  const disallowed = [...text.matchAll(/^Disallow:\s*([^#\r\n]*)/gim)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  for (const route of [...noindexPaths, '/admin/']) {
    for (const rule of disallowed) {
      const pattern = rule
        .split('*')
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
      check(
        !new RegExp(`^${pattern}`).test(route),
        'robots.txt',
        `noindex route must stay crawlable: ${route} is blocked by ${rule}`
      );
    }
  }
}

async function main() {
  try {
    await stat(dist);
  } catch {
    throw new Error(
      'dist/ is missing. Run npm run build before npm run check:seo.'
    );
  }
  const files = await walk(dist);
  const routes = new Map(
    files
      .filter((file) => /\.html$/i.test(file))
      .map((file) => [routeFromFile(file), file])
  );
  check(routes.size > 0, 'dist/', 'no HTML files found');
  for (const route of [...Object.values(pagePaths), '/book/'])
    check(routes.has(route), route, 'required route has no built HTML');
  const articles = await sourceArticles();
  const matchedSources = new Set();
  for (const [route, file] of routes)
    await validatePage(file, route, articles, matchedSources);
  for (const article of articles)
    check(
      matchedSources.has(article.file),
      relative(root, article.file),
      'source article has no matching built article metadata'
    );
  validateListings(routes);
  const imageCount = await validateImages(files, articles.length);
  await validateSitemaps(files, routes);
  await validateRobots();
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  for (const error of errors) console.error(`FAIL ${error}`);
  if (errors.length) {
    console.error(
      `SEO check failed with ${errors.length} error(s) across ${routes.size} HTML routes.`
    );
    process.exitCode = 1;
  } else {
    console.log(
      `SEO check passed: ${routes.size} HTML routes, ${articles.length} articles, ${imageCount} PNG cards. ${warnings.length} editorial warning(s).`
    );
  }
}

main().catch((error) => {
  console.error(`SEO check failed: ${error.message}`);
  process.exitCode = 1;
});
