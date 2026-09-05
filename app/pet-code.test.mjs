import test from 'node:test';
import assert from 'node:assert/strict';
import { encodePetCode, parsePetCode } from './pet-code.ts';
test('pet QR payload is limited to known demo pets and self', () => {
  for (const id of ['me', 'tudou', 'doubao'])
    assert.equal(parsePetCode(encodePetCode(id)), id);
  for (const code of [
    'https://example.com',
    'javascript:alert(1)',
    'pengzhua:demo:pet:unknown',
    'pengzhua:demo:pet:tudou?accept=1',
    'pengzhua:demo:pet:tudou\n',
  ])
    assert.equal(parsePetCode(code), null);
  assert.throws(() => encodePetCode('unknown'));
});
