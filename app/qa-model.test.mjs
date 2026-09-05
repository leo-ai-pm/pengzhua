import test from 'node:test';
import assert from 'node:assert/strict';
import {
  invitationLabel,
  isUpcomingInvitation,
  careForDate,
} from './qa-model.ts';
import { beijingPlaces, withBeijingPlaces } from './beijing-places.ts';
const now = new Date('2026-09-05T20:00:00+08:00').getTime();
const inv = {
  id: 'qa',
  friend: 'doubao',
  place: 'p1',
  note: '',
  date: '2026-09-04T17:00:00+08:00',
  status: '待回应',
};
test('expired and cancelled invitations have consistent status and are not upcoming', () => {
  assert.equal(invitationLabel(inv, now), '已过期');
  assert.equal(isUpcomingInvitation(inv, now), false);
  assert.equal(
    invitationLabel({ ...inv, status: '已接受' }, now),
    '已到约定时间',
  );
  assert.equal(
    isUpcomingInvitation(
      { ...inv, date: '2026-09-06T17:00:00+08:00', status: '已取消' },
      now,
    ),
    false,
  );
  assert.equal(
    isUpcomingInvitation(
      { ...inv, date: '2026-09-06T17:00:00+08:00', status: '已接受' },
      now,
    ),
    true,
  );
});
test('care calendar respects year month day and never dates undated legacy entries', () => {
  const records = [
    { id: 'today', kind: '喂食', time: '9/5', recordedAt: now },
    { id: 'old', kind: '洗澡', time: '9/5' },
  ];
  assert.deepEqual(
    careForDate(records, 2026, 8, 5).map((c) => c.id),
    ['today'],
  );
  assert.equal(careForDate(records, 2026, 7).length, 0);
  assert.equal(careForDate(records, 2025, 8).length, 0);
  assert.equal(careForDate(records, 2026, 8, 4).length, 0);
});
test('personal experience survives catalog merge without replacing official facts', () => {
  const p = beijingPlaces[0];
  const custom = {
    ...p,
    desc: 'QA体验文字',
    features: ['饮水'],
    contributed: true,
    location: [0, 0],
  };
  const result = withBeijingPlaces([custom]).find((x) => x.id === p.id);
  assert.equal(result.experience.note, 'QA体验文字');
  assert.deepEqual(result.experience.features, ['饮水']);
  assert.equal(result.desc, p.desc);
  assert.deepEqual(result.location, p.location);
  assert.deepEqual(result.petGuide, p.petGuide);
});
