// Releases: one version across the package and the plugin, and the tag check (DIB-21).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { problems, versions } from '../scripts/check-release.mjs';

test('package.json, plugin.json and marketplace.json carry one version', () => {
  assert.deepEqual(problems(), []);
});

test('a release tag must be v<version>', () => {
  const v = versions()['package.json'];
  assert.deepEqual(problems(`v${v}`), []);
  assert.equal(problems('v99.0.0').length, 1);
  assert.equal(problems(v).length, 1, 'the tag needs its v');
});
