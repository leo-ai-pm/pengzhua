/** Demo relationship state: buddyIds contains mutually accepted friendships only. */
export function contactAccess(
  buddyIds: readonly string[],
  requests: readonly string[],
  petId: string,
) {
  const friend = !!petId && petId !== 'me' && buddyIds.includes(petId);
  const pending = requests.includes(petId);
  return {
    friend,
    pending,
    canMessage: friend,
    canInvite: friend,
    canRequest: !!petId && petId !== 'me' && !friend && !pending,
  };
}
