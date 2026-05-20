import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatFindingsMarkdown } from '../src/report.js';

const SAMPLE_FINDINGS = [
  {
    category: 'cat.color',
    ruleId: 'color-contrast',
    description: 'Ensure sufficient colour contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/color-contrast',
    selector: '.hero h1',
    summary: 'Fix: increase contrast ratio',
    path: '/',
  },
  {
    category: 'cat.text-alternatives',
    ruleId: 'image-alt',
    description: 'Ensure images have alt text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/image-alt',
    selector: '.photo img',
    summary: 'Fix: add alt attribute',
    path: '/',
  },
];

test('formatFindingsMarkdown returns pass message when no findings', () => {
  assert.equal(formatFindingsMarkdown([]), '✅ No accessibility violations found.');
});

test('formatFindingsMarkdown includes total violation count', () => {
  const result = formatFindingsMarkdown(SAMPLE_FINDINGS);
  assert.ok(result.includes('2 violation'));
});

test('formatFindingsMarkdown includes selectors', () => {
  const result = formatFindingsMarkdown(SAMPLE_FINDINGS);
  assert.ok(result.includes('.hero h1'));
  assert.ok(result.includes('.photo img'));
});

test('formatFindingsMarkdown uses alias labels when provided', () => {
  const aliases = { contrast: 'cat.color', 'alt-text': 'cat.text-alternatives' };
  const result = formatFindingsMarkdown(SAMPLE_FINDINGS, aliases);
  assert.ok(result.includes('contrast'));
  assert.ok(result.includes('alt-text'));
});

test('formatFindingsMarkdown falls back to raw category when no alias', () => {
  const result = formatFindingsMarkdown(SAMPLE_FINDINGS);
  assert.ok(result.includes('cat.color'));
});

test('formatFindingsMarkdown includes /fix instruction', () => {
  const result = formatFindingsMarkdown(SAMPLE_FINDINGS);
  assert.ok(result.includes('/fix'));
});
