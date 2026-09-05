import test from 'node:test';
import assert from 'node:assert/strict';
import { contactAccess } from './contact-policy.ts';
test('strangers can request but cannot message or invite', () => {
  assert.deepEqual(contactAccess(['doubao'], [], 'tudou'), {
    friend: false,
    pending: false,
    canMessage: false,
    canInvite: false,
    canRequest: true,
  });
});
test('pending application does not grant contact permission or permit repeats', () => {
  const access = contactAccess(['doubao'], ['tudou'], 'tudou');
  assert.equal(access.pending, true);
  assert.equal(access.canRequest, false);
  assert.equal(access.canMessage, false);
  assert.equal(access.canInvite, false);
});
test('only mutual acceptance unlocks chat and walking invitations', () => {
  const access = contactAccess(['doubao', 'tudou'], [], 'tudou');
  assert.equal(access.canInvite, true);
  assert.equal(access.canMessage, true);
  assert.equal(access.canRequest, false);
});
test('removed friendship revokes contact and self never permits invitation', () => {
  assert.equal(contactAccess([], [], 'doubao').canInvite, false);
  assert.equal(contactAccess(['me'], [], 'me').canInvite, false);
  assert.equal(contactAccess([], [], '').canRequest, false);
});
