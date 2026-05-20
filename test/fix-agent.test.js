import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safePath } from '../src/fix-agent.js';

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

test('safePath blocks absolute paths outside the root', () => {
  assert.equal(safePath('/etc/passwd', ROOT), null);
  assert.equal(safePath('/project-other/file.js', ROOT), null);
});
