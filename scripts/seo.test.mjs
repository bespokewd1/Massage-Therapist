import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isIndexablePath,
  normalizePathname,
  noindexPaths,
  pagePaths,
} from '../src/lib/seo-policy.mjs';
import { documentTitle } from '../src/lib/seo-text.mjs';

test('path normalization removes query and fragment without changing route content', () => {
  for (const [input, expected] of [
    ['', '/'],
    ['///', '/'],
    ['blog', '/blog/'],
    ['/blog/2/?sort=latest#posts', '/blog/2/'],
    ['///gallery/inside///', '/gallery/inside/'],
    ['/blog/massage-caf\u00e9/#read', '/blog/massage-caf\u00e9/'],
  ]) {
    assert.equal(normalizePathname(input), expected);
    assert.equal(
      normalizePathname(expected),
      expected,
      'normalized paths are stable'
    );
  }
});

test('primary page routes are unique, normalized, and indexable', () => {
  const routes = Object.values(pagePaths);
  assert.ok(routes.length > 0);
  assert.equal(new Set(routes).size, routes.length);
  for (const route of routes) {
    assert.equal(normalizePathname(route), route);
    assert.equal(isIndexablePath(route), true, route);
  }
});

test('legacy and old booking routes stay excluded across URL variants', () => {
  assert.ok(noindexPaths.length > 0);
  for (const route of [...noindexPaths, '/book/']) {
    for (const variant of [
      route,
      route.slice(0, -1),
      `${route}?utm_source=test#section`,
    ]) {
      assert.equal(isIndexablePath(variant), false, variant);
    }
  }
  assert.equal(isIndexablePath(pagePaths.booking), true);
  assert.notEqual(normalizePathname('/book'), pagePaths.booking);
});

test('admin, development, and generated-image route trees are excluded at segment boundaries', () => {
  for (const tree of ['admin', 'dev', 'og']) {
    for (const route of [
      `/${tree}`,
      `/${tree}/`,
      `/${tree}/nested/preview/?x=1`,
    ]) {
      assert.equal(isIndexablePath(route), false, route);
    }
    assert.equal(
      isIndexablePath(`/${tree}-information/`),
      true,
      'similar public names are not reserved'
    );
  }
});

test('document titles normalize whitespace and only skip an exact brand or existing suffix', () => {
  const brand = 'Stone Massage';
  assert.equal(
    documentTitle('Hot Stone Massage Benefits', brand),
    'Hot Stone Massage Benefits | Stone Massage'
  );
  assert.equal(documentTitle(brand, brand), brand);
  assert.equal(
    documentTitle('Booking | Stone Massage', brand),
    'Booking | Stone Massage'
  );
  assert.equal(
    documentTitle('  Massage\n   in Edmonton  ', brand),
    'Massage in Edmonton | Stone Massage'
  );
});

test('blog listings, pagination, and article routes remain indexable', () => {
  for (const route of [
    pagePaths.blog,
    '/blog/2/',
    '/blog/6/?page=6',
    '/blog/a-massage-article/',
  ]) {
    assert.equal(isIndexablePath(route), true, route);
  }
});
