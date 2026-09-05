import test from 'node:test';
import assert from 'node:assert/strict';
import {
  visiblePresences,
  activeWalk,
  finishWalk,
  walkMinutes,
  filterPlaces,
  walkPlaces,
} from './walk-model.ts';
const now = 1000000;
const presence = {
  petId: 'buddy',
  placeId: 'p1',
  startedAt: now - 60000,
  expiresAt: now + 60000,
  visibility: 'friends',
};
test('only mutual friends with active opted-in sharing appear', () => {
  const candidates = [
    presence,
    { ...presence, petId: 'stranger' },
    { ...presence, petId: 'private', visibility: 'private' },
    { ...presence, petId: 'ended', endedAt: now - 1 },
    { ...presence, petId: 'expired', expiresAt: now },
    { ...presence, petId: 'future', startedAt: now + 1 },
  ];
  assert.deepEqual(
    visiblePresences(
      candidates,
      ['buddy', 'private', 'ended', 'expired', 'future'],
      now,
    ),
    [presence],
  );
  assert.deepEqual(visiblePresences([presence], [], now), []);
});
test('ending is idempotent and immediately stops visibility', () => {
  const walk = { ...presence, id: 'walk1' };
  const ended = finishWalk(walk, now);
  assert.equal(activeWalk(ended, now), false);
  assert.equal(ended.visibility, 'private');
  assert.deepEqual(finishWalk(ended, now + 30000), ended);
  assert.equal(walkMinutes(ended, now + 30000), 1);
});
test('expired sessions do not count time beyond expiry', () => {
  const walk = { ...presence, id: 'walk1' };
  assert.equal(activeWalk(walk, now + 60000), false);
  assert.equal(walkMinutes(finishWalk(walk, now + 999999), now + 999999), 2);
});
test('friend filter removes stale sharing and combines with search', () => {
  const live = visiblePresences([presence], ['buddy'], now);
  assert.deepEqual(
    filterPlaces(walkPlaces, '好友在遛', '西岸', [], live).map((p) => p.id),
    ['p1'],
  );
  assert.equal(
    filterPlaces(
      walkPlaces,
      '好友在遛',
      '',
      [],
      visiblePresences([presence], ['buddy'], now + 60000),
    ).length,
    0,
  );
  assert.deepEqual(
    filterPlaces(walkPlaces, '我的收藏', '', ['p3'], live).map((p) => p.id),
    ['p3'],
  );
});
