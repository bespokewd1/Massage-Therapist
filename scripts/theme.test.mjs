import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/js/theme.js', import.meta.url), 'utf8');

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) ?? [];
      callbacks.push(callback);
      listeners.set(type, callbacks);
    },
    emit(type, event = {}) {
      for (const callback of listeners.get(type) ?? []) callback(event);
    },
  };
}

function makeDocument() {
  const classes = new Set();
  const button = { setAttribute(name, value) { this[name] = value; } };
  const meta = { setAttribute(name, value) { this[name] = value; } };
  return {
    ...eventTarget(),
    button,
    meta,
    body: { classList: {
      contains: (name) => classes.has(name),
      toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); },
    } },
    documentElement: { style: {} },
    getElementById: (id) => id === 'dark-mode-toggle' ? button : null,
    querySelector: () => meta,
  };
}

function start({ stored = null, systemDark = false, denyStorage = false } = {}) {
  const document = makeDocument();
  const media = { ...eventTarget(), matches: systemDark };
  const writes = [];
  const window = {
    ...eventTarget(),
    localStorage: {
      getItem() { if (denyStorage) throw new Error('Denied'); return stored; },
      setItem(key, value) { if (denyStorage) throw new Error('Denied'); writes.push([key, value]); },
    },
    matchMedia: () => media,
    getComputedStyle: () => ({ getPropertyValue: () =>
      context.document.body.classList.contains('dark-mode') ? '#12110f' : '#fff',
    }),
  };
  const context = vm.createContext({ document, window });
  const run = () => vm.runInContext(source, context);
  const click = () => document.emit('click', { target: { closest: () => document.button } });
  run();
  return { document, window, context, media, writes, run, click };
}

function assertTheme(document, theme) {
  assert.equal(document.body.classList.contains('dark-mode'), theme === 'dark');
  assert.equal(document.documentElement.style.colorScheme, theme);
  assert.equal(document.button['aria-pressed'], String(theme === 'dark'));
  assert.equal(document.meta.content, theme === 'dark' ? '#12110f' : '#fff');
}

test('explicit saved choices override either system theme without rewriting storage', () => {
  for (const stored of ['light', 'dark']) {
    for (const systemDark of [false, true]) {
      const state = start({ stored, systemDark });
      assertTheme(state.document, stored);
      assert.deepEqual(state.writes, []);
    }
  }
});

test('system choice is applied early and follows changes only until a user chooses', () => {
  const state = start({ systemDark: true });
  assertTheme(state.document, 'dark');
  assert.deepEqual(state.writes, []);
  state.media.matches = false;
  state.media.emit('change');
  assertTheme(state.document, 'light');
  state.click();
  assertTheme(state.document, 'dark');
  assert.deepEqual(state.writes, [['theme', 'dark']]);
  state.media.emit('change');
  assertTheme(state.document, 'dark');
});

test('invalid saved values fall back to the system preference', () => {
  const state = start({ stored: 'unknown', systemDark: true });
  assertTheme(state.document, 'dark');
  assert.deepEqual(state.writes, []);
});

test('denied storage keeps system fallback and the explicit choice in memory', () => {
  const state = start({ systemDark: true, denyStorage: true });
  assertTheme(state.document, 'dark');
  state.click();
  assertTheme(state.document, 'light');
  state.media.emit('change');
  assertTheme(state.document, 'light');
  state.run();
  assertTheme(state.document, 'light');
});

test('repeated inline execution does not duplicate toggle or lifecycle listeners', () => {
  const state = start();
  state.run();
  state.run();
  for (const type of ['click', 'astro:before-swap', 'astro:after-swap', 'astro:page-load']) {
    assert.equal(state.document.listeners.get(type).length, 1, type);
  }
  state.click();
  assertTheme(state.document, 'dark');
  assert.equal(state.writes.length, 1);
});

test('incoming body, native scheme and toggle are themed before and after Astro swaps', () => {
  const state = start({ stored: 'dark' });
  const incoming = makeDocument();
  state.document.emit('astro:before-swap', { newDocument: incoming });
  assertTheme(incoming, 'dark');
  Object.assign(state.document, {
    body: incoming.body,
    documentElement: incoming.documentElement,
    button: incoming.button,
    meta: incoming.meta,
    getElementById: incoming.getElementById,
    querySelector: incoming.querySelector,
  });
  state.document.emit('astro:after-swap');
  state.document.emit('astro:page-load');
  assertTheme(state.document, 'dark');
  state.click();
  assertTheme(state.document, 'light');
});

test('theme removal in another tab resumes system-following behavior', () => {
  const state = start({ stored: 'dark' });
  state.window.emit('storage', { key: 'theme', newValue: null });
  assertTheme(state.document, 'light');
  state.media.matches = true;
  state.media.emit('change');
  assertTheme(state.document, 'dark');
  state.window.emit('storage', { key: 'theme', newValue: 'light' });
  assertTheme(state.document, 'light');
});
