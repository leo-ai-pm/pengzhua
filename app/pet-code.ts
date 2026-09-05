const prefix = 'pengzhua:demo:pet:';
const knownPets = new Set([
  'me',
  'tangyuan',
  'zhima',
  'doubao',
  'cookie',
  'niangao',
  'tudou',
]);

export function encodePetCode(id: string): string {
  if (!knownPets.has(id)) throw new Error('Unknown demo pet');
  return prefix + id;
}

/** A scanned URL or arbitrary text never opens a page or grants friendship. */
export function parsePetCode(value: string): string | null {
  if (!value.startsWith(prefix)) return null;
  const id = value.slice(prefix.length);
  return knownPets.has(id) ? id : null;
}
