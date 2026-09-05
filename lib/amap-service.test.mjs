import test from 'node:test';
import assert from 'node:assert/strict';
import { amapUpstream } from './amap-service.ts';
import { isLocated, amapNavigation, fromPOI } from './amap-client.ts';
import { walkPlaces } from '../app/walk-model.ts';
test('proxy pins official hosts and replaces supplied credentials', () => {
  const url = amapUpstream(
    'v3/place/text',
    '?keywords=望京&key=attacker&jscode=attacker',
    'project-key',
    'server-secret',
  );
  assert.equal(url.origin, 'https://restapi.amap.com');
  assert.equal(url.searchParams.get('key'), 'project-key');
  assert.equal(url.searchParams.get('jscode'), 'server-secret');
  assert.equal(url.searchParams.get('keywords'), '望京');
  assert.equal(
    amapUpstream('v4/map/styles', '', 'k', 's').hostname,
    'webapi.amap.com',
  );
  for (const path of [
    'https://example.com',
    '//example.com',
    'v3/../private',
    'v3/%2e%2e/private',
    'v3/place?redirect=foo',
  ])
    assert.equal(amapUpstream(path, '', 'k', 's'), null);
});
test('legacy illustrative locations cannot become real map pins or navigation', () => {
  for (const p of walkPlaces) {
    assert.equal(isLocated(p), false);
    assert.equal(amapNavigation(p), null);
  }
  assert.equal(isLocated({ ...walkPlaces[0], location: [NaN, 40] }), false);
  assert.equal(isLocated({ ...walkPlaces[0], location: [116, 100] }), false);
});
test('real POI retains provider coordinates without asserting pet admission', () => {
  const p = fromPOI({
    id: 'test-poi',
    name: '公园 & 入口',
    address: '测试地址',
    type: '公园',
    location: { getLng: () => 116.48, getLat: () => 39.99 },
  });
  assert.deepEqual(p.location, [116.48, 39.99]);
  assert.equal(p.source, 'amap');
  assert.deepEqual(p.features, ['携宠规则待核实']);
  const url = new URL(amapNavigation(p));
  assert.equal(url.searchParams.get('to'), '116.48,39.99,公园 & 入口');
  assert.equal(url.searchParams.get('coordinate'), 'gaode');
  assert.equal(url.searchParams.get('mode'), 'walk');
});
