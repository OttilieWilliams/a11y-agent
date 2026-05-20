import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCategory } from '../src/audit.js';

test('resolveCategory maps all friendly aliases to axe tags', () => {
  assert.equal(resolveCategory('contrast'), 'cat.color');
  assert.equal(resolveCategory('alt-text'), 'cat.text-alternatives');
  assert.equal(resolveCategory('labels'), 'cat.forms');
  assert.equal(resolveCategory('aria'), 'cat.aria');
  assert.equal(resolveCategory('structure'), 'cat.structure');
  assert.equal(resolveCategory('keyboard'), 'cat.keyboard');
  assert.equal(resolveCategory('tables'), 'cat.tables');
  assert.equal(resolveCategory('sensory'), 'cat.sensory-and-visual-cues');
});

test('resolveCategory passes through unknown names unchanged', () => {
  assert.equal(resolveCategory('cat.color'), 'cat.color');
  assert.equal(resolveCategory('something-custom'), 'something-custom');
});
