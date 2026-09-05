import test from 'node:test';
import assert from 'node:assert/strict';
import { postDistance } from './social-details.ts';
test('seed distances are explicitly demonstrations', () => {
  assert.equal(postDistance({ id: 's1', pet: 'doubao' }), '距你 800 m · 示例');
});
test('unlocated new posts never invent distance', () => {
  assert.equal(postDistance({ id: 'new', pet: 'me' }), '我的日常 · 未共享位置');
  assert.equal(
    postDistance({ id: 'new', pet: 'doubao' }),
    '距离未知 · 未共享位置',
  );
});
