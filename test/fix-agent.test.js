import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safePath, parseCmd } from '../src/fix-agent.js';

const ROOT = '/project';

test('safePath allows files within the project root', () => {
  assert.equal(safePath('index.html', ROOT), '/project/index.html');
  assert.equal(safePath('css/style.css', ROOT), '/project/css/style.css');
  assert.equal(safePath('nested/deep/file.js', ROOT), '/project/nested/deep/file.js');
});

test('safePath allows the root directory itself', () => {
  assert.equal(safePath('.', ROOT), '/project');
});

test('safePath blocks path traversal attempts', () => {
  assert.equal(safePath('../outside', ROOT), null);
  assert.equal(safePath('../../etc/passwd', ROOT), null);
  assert.equal(safePath('../project-sibling', ROOT), null);
});

test('parseCmd splits simple commands', () => {
  assert.deepEqual(parseCmd('git add -A'), ['git', 'add', '-A']);
  assert.deepEqual(parseCmd('git push'), ['git', 'push']);
});

test('parseCmd keeps quoted strings with spaces intact', () => {
  assert.deepEqual(
    parseCmd('git commit -m "fix(a11y): fix all violations [a11y-agent]"'),
    ['git', 'commit', '-m', 'fix(a11y): fix all violations [a11y-agent]']
  );
});

test('parseCmd handles single quotes', () => {
  assert.deepEqual(
    parseCmd("git commit -m 'my message here'"),
    ['git', 'commit', '-m', 'my message here']
  );
});

test('safePath blocks absolute paths outside the root', () => {
  assert.equal(safePath('/etc/passwd', ROOT), null);
  assert.equal(safePath('/project-other/file.js', ROOT), null);
});
