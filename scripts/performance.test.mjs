import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
// Reviewed baseline hashes protect against changing both copies accidentally.
const fonts = [
  {
    family: 'Open Sans',
    weight: 400,
    file: 'open-sans-v40-latin-regular.woff2',
    sha256: 'e7af9d60d875eb1c1b1037bbbfdec41fcb096d0ebcf98a48717ad8b07906ced6',
  },
  {
    family: 'Open Sans',
    weight: 500,
    file: 'open-sans-v40-latin-500.woff2',
    sha256: '1f6e5ae697330d08acadf0299418b94a102dcc63f483b3f3ec821cc7e36ef8dc',
  },
  {
    family: 'Open Sans',
    weight: 600,
    file: 'open-sans-v40-latin-600.woff2',
    sha256: '7f7fcda5f37c18def2314b911b02417b773c4f459df0d25931ffa7389b872b89',
  },
  {
    family: 'Open Sans',
    weight: 700,
    file: 'open-sans-v40-latin-700.woff2',
    sha256: '114f872abf6cae70383b09ca2168821991fde718702d79cdc457a49b03560cb0',
  },
  {
    family: 'Open Sans',
    weight: 800,
    file: 'open-sans-v40-latin-800.woff2',
    sha256: '3403fa778109bceb18b607b327d3a721f225555e078ccbdacb4238b733856ff7',
  },
  {
    family: 'Poppins',
    weight: 400,
    file: 'poppins-400.woff2',
    sha256: '7d93459d86585bfcdbb7e0376056226adb25821ee54b96236fe2123e9560929f',
  },
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const file = join(directory, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
      })
    )
  ).flat();
}

async function siteDocuments() {
  const excluded = new Set([
    join(dist, 'admin/index.html'),
    join(dist, 'book/index.html'),
  ]);
  const files = (await walk(dist)).filter(
    (file) => file.endsWith('.html') && !excluded.has(file)
  );
  assert.ok(
    files.length >= 32,
    'expected every current site document, not an empty or partial build'
  );
  return files;
}

function documentHead(html) {
  return (
    html
      .replace(/<!--[\s\S]*?-->/g, '')
      .match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
  );
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [
      match[1],
      match[2],
    ])
  );
}

test('Astro stays pinned to the reviewed 5.x release', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(
    await readFile(join(root, 'package-lock.json'), 'utf8')
  );
  assert.equal(pkg.dependencies.astro, '5.18.2');
  assert.equal(lock.packages['node_modules/astro'].version, '5.18.2');
});

test('featured article ordering does not depend on collection enumeration', async () => {
  const order = JSON.parse(
    await readFile(join(root, 'src/data/featured-post-order.json'), 'utf8')
  );
  const files = (await walk(join(dist, 'blog'))).filter((file) =>
    file.endsWith('.html')
  );
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const featured = [
      ...html.matchAll(/<a class="blog-feature" href="\/blog\/([^"/]+)\/?"/g),
    ].map((match) => match[1]);
    assert.deepEqual(
      featured.filter((id) => order.includes(id)),
      order,
      file
    );
  }
});

test('managed fonts use the exact existing binaries and keep legacy URLs available', async () => {
  const generated = await walk(join(dist, '_astro', 'fonts'));
  const generatedHashes = new Set(
    await Promise.all(generated.map(async (file) => hash(await readFile(file))))
  );
  for (const { file, sha256 } of fonts) {
    const original = await readFile(
      join(root, 'public', 'assets', 'fonts', file)
    );
    const managed = await readFile(join(root, 'src', 'assets', 'fonts', file));
    assert.equal(hash(original), sha256, file);
    assert.equal(hash(managed), sha256, file);
    assert.ok(
      generatedHashes.has(hash(original)),
      `${file} must be copied unchanged to the build`
    );
    assert.equal(
      hash(await readFile(join(dist, 'assets', 'fonts', file))),
      hash(original)
    );
  }
});

test('all site layouts declare both managed families once without preloading unrelated fonts', async () => {
  const files = await siteDocuments();
  const persistenceKeys = new Map();
  const medium = hash(
    await readFile(
      join(root, 'public/assets/fonts/open-sans-v40-latin-500.woff2')
    )
  );
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const head = documentHead(html);
    assert.ok(
      html.includes('id="dark-mode-toggle"'),
      `missing site layout: ${file}`
    );
    for (const id of ['site-font-open-sans', 'site-font-poppins']) {
      const styles = [
        ...head.matchAll(
          new RegExp(
            `<style data-astro-transition-persist="(${id}-([a-f0-9]{16}))">([\\s\\S]*?)<\\/style>`,
            'g'
          )
        ),
      ];
      assert.equal(
        styles.length,
        1,
        `font styles must persist across ClientRouter swaps: ${id}, ${file}`
      );
      assert.equal(
        styles[0][2],
        hash(styles[0][3]).slice(0, 16),
        'font CSS changes must invalidate persistence'
      );
      if (!persistenceKeys.has(id)) persistenceKeys.set(id, styles[0][1]);
      assert.equal(
        styles[0][1],
        persistenceKeys.get(id),
        `font persistence must match across layouts: ${file}`
      );
    }
    assert.equal(
      (head.match(/font-family:"Open Sans-[^"]+";src:/g) ?? []).length,
      5,
      file
    );
    const faces = [...head.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
      (match) => match[1]
    );
    for (const font of fonts) {
      const matching = faces.filter(
        (face) =>
          face.includes(
            `font-family:${font.family === 'Open Sans' ? '"Open Sans-' : 'Poppins-'}`
          ) && face.includes(`font-weight:${font.weight};`)
      );
      assert.equal(
        matching.length,
        1,
        `${font.family} ${font.weight}: ${file}`
      );
      assert.match(matching[0], /font-display:swap;/);
      assert.match(matching[0], /font-style:normal;/);
      const src = matching[0].match(/src:url\("([^"]+)"\)/)?.[1];
      assert.ok(src, file);
      assert.equal(
        hash(await readFile(join(dist, src))),
        font.sha256,
        `${font.file}: ${file}`
      );
    }
    assert.equal(
      (head.match(/font-family:"?Poppins-[^;]+;src:/g) ?? []).length,
      1,
      file
    );
    const preloads = [...head.matchAll(/<link\b[^>]*>/g)]
      .map((match) => attributes(match[0]))
      .filter((link) => link.rel === 'preload' && link.as === 'font');
    assert.equal(
      preloads.length,
      file === join(dist, 'index.html') ? 1 : 0,
      file
    );
    const preloadTags = [...head.matchAll(/<link\b[^>]*>/g)].map(
      (match) => match[0]
    );
    for (const link of preloads) {
      assert.equal(link.type, 'font/woff2');
      assert.equal(hash(await readFile(join(dist, link.href))), medium);
      assert.ok(
        preloadTags.some(
          (tag) =>
            tag.includes(`href="${link.href}"`) &&
            /\bcrossorigin(?:[\s=>])/.test(tag)
        ),
        file
      );
    }
  }
});

test('homepage retains a cacheable global stylesheet and responsive hero preloads', async () => {
  const head = documentHead(await readFile(join(dist, 'index.html'), 'utf8'));
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map((match) =>
    attributes(match[0])
  );
  const styles = links.filter((link) => link.rel === 'stylesheet');
  assert.equal(
    styles.length,
    1,
    'keep the shared global CSS external, inline bundles under 20 KiB'
  );
  for (const link of styles) {
    assert.ok((await readFile(join(dist, link.href))).length >= 20 * 1024);
  }
  const heroes = links.filter(
    (link) => link.rel === 'preload' && link.as === 'image'
  );
  assert.ok(
    heroes.some(
      (link) =>
        link.href === '/assets/images/hero-img_mobile.webp' &&
        link.media === '(max-width: 768px)' &&
        link.fetchpriority === 'high'
    )
  );
  assert.ok(
    heroes.some(
      (link) =>
        link.href === '/assets/images/hero-img.avif' &&
        link.media === '(min-width: 769px)' &&
        link.fetchpriority === 'high'
    )
  );
});

test('GTM bootstrap and no-script fallback remain unchanged', async () => {
  const source = await readFile(
    join(root, 'src/layouts/BaseLayout.astro'),
    'utf8'
  );
  const bootstrap = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .find((script) => script.includes('GTM-KJSHS6L8'));
  assert.ok(bootstrap);
  assert.equal(
    hash(bootstrap.replace(/\r\n/g, '\n')),
    '4ba9b46c3bbacf340052b73db89cfbcfee251f97606fb4696f8906f0c8b3f66c'
  );
  assert.match(
    source,
    /src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-KJSHS6L8"/
  );
  for (const file of await siteDocuments()) {
    // The standalone booking document and secondary layout never had GTM.
    const withoutGtm = [
      join(dist, 'booking/index.html'),
      join(dist, 'giftcertificate/index.html'),
    ].includes(file);
    const html = (await readFile(file, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
    const scripts = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)]
      .map((match) => match[0])
      .filter((script) => script.includes('GTM-KJSHS6L8'));
    const noscripts = [
      ...html.matchAll(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/g),
    ]
      .map((match) => match[0])
      .filter((script) => script.includes('GTM-KJSHS6L8'));
    assert.equal(scripts.length, withoutGtm ? 0 : 1, file);
    assert.equal(noscripts.length, withoutGtm ? 0 : 1, file);
    if (withoutGtm) continue;
    assert.equal(
      hash(scripts[0].replace(/\s+/g, ' ').trim()),
      'e8e10e847379a58697e5a5d20691d45a087a343ada33b0dc21eaca296042e04d',
      file
    );
    assert.equal(
      hash(noscripts[0].replace(/\s+/g, ' ').trim()),
      'd9ae94c1da6a9aa7f08472f18c75aff9dabd203ed2defe16e31f2583d724f1dd',
      file
    );
  }
});

test('original font fallback chains and Roboto declarations are retained', async () => {
  const rootStyle = await readFile(join(root, 'src/styles/root.less'), 'utf8');
  assert.match(
    rootStyle,
    /font-family:\s*var\(--font-open-sans\),\s*'Roboto',\s*Arial,\s*sans-serif;/
  );
  assert.match(
    rootStyle,
    /font-family:\s*var\(--font-poppins\),\s*sans-serif;/
  );
  assert.equal((rootStyle.match(/font-family:\s*'Roboto';/g) ?? []).length, 3);
});

test('site icons match their advertised PNG dimensions and use a valid browser manifest', async () => {
  const files = await siteDocuments();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const links = [...documentHead(html).matchAll(/<link\b[^>]*>/g)].map(
      (match) => attributes(match[0])
    );
    const icons = links.filter((link) =>
      ['icon', 'apple-touch-icon'].includes(link.rel)
    );
    assert.equal(icons.length, 4, file);
    for (const icon of icons) {
      const bytes = await readFile(join(dist, icon.href));
      assert.equal(
        bytes.subarray(0, 8).toString('hex'),
        '89504e470d0a1a0a',
        icon.href
      );
      assert.equal(
        `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,
        icon.sizes,
        icon.href
      );
      if (icon.rel === 'icon') assert.equal(icon.type, 'image/png');
    }
    const manifests = links.filter((link) => link.rel === 'manifest');
    assert.equal(manifests.length, 1, file);
    const manifest = JSON.parse(
      await readFile(join(dist, manifests[0].href), 'utf8')
    );
    assert.equal(manifest.name, 'Stone Massage');
    assert.equal(manifest.display, 'browser');
    for (const icon of manifest.icons) {
      const bytes = await readFile(join(dist, icon.src));
      assert.equal(icon.type, 'image/png');
      assert.equal(
        `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,
        icon.sizes
      );
    }
  }
});
