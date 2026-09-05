/** Official JS API proxy destinations; never accepts an arbitrary upstream host. */
export function amapUpstream(
  path: string,
  search: string,
  key: string,
  secret: string,
): URL | null {
  let origin: string;
  if (path === 'v4/map/styles') origin = 'https://webapi.amap.com';
  else if (/^v[345]\/[a-zA-Z0-9/_-]+$/.test(path) && !path.includes('..'))
    origin = 'https://restapi.amap.com';
  else return null;
  const url = new URL('/' + path, origin);
  url.search = search;
  url.searchParams.set('key', key);
  url.searchParams.set('jscode', secret);
  return url;
}
