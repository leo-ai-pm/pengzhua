import test from 'node:test';
import assert from 'node:assert/strict';
import { beijingPlaces, withBeijingPlaces } from './beijing-places.ts';
import { amapNavigation } from '../lib/amap-client.ts';

test('stored copies cannot duplicate or replace catalog coordinates and sources', () => {
  const original = beijingPlaces[0];
  const custom = { ...original, id: 'amap-user-place', petGuide: undefined };
  const result = withBeijingPlaces([
    { ...original, location: [0, 0], petGuide: undefined, photoUrl: 'data:image/png;base64,userphoto' },
    custom,
  ]);
  assert.equal(result.length, beijingPlaces.length + 1);
  const merged = result.find(p => p.id === original.id);
  assert.deepEqual(merged.location, original.location);
  assert.deepEqual(merged.petGuide, original.petGuide);
  assert.equal(merged.photoUrl, 'data:image/png;base64,userphoto');
  assert.deepEqual(result.find(p => p.id === custom.id), custom);
});

test('initial Beijing catalog has four unique navigable POIs and traceable admission evidence', () => {
  assert.equal(beijingPlaces.length, 4);
  assert.equal(new Set(beijingPlaces.map(p => p.id)).size, 4);
  for (const p of beijingPlaces) {
    assert.ok(p.location[0] > 115 && p.location[0] < 118);
    assert.ok(p.location[1] > 39 && p.location[1] < 42);
    assert.ok(amapNavigation(p));
    assert.ok(p.petGuide.entry && p.petGuide.rules.length);
    assert.ok(p.petGuide.sources.every(s => new URL(s.url).protocol === 'https:'));
  }
});
