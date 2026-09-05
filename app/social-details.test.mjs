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

import { selectFeedPosts } from './social-details.ts';
import { seedPosts } from './demo-data.ts';
test('public square includes both friends and strangers while friend feed stays filtered', () => {
  const buddies = ['doubao', 'cookie', 'niangao'];
  const square = selectFeedPosts(seedPosts, '广场', buddies, []);
  assert.equal(square.length, seedPosts.length);
  assert.ok(square.some((p) => buddies.includes(p.pet)));
  assert.ok(square.some((p) => !buddies.includes(p.pet)));
  assert.equal(square[0].pet, 'tudou');
  assert.ok(
    selectFeedPosts(seedPosts, '好友圈', buddies, []).every((p) =>
      buddies.includes(p.pet),
    ),
  );
  assert.deepEqual(
    selectFeedPosts(seedPosts, '我的收藏', buddies, ['s8']).map((p) => p.id),
    ['s8'],
  );
});
