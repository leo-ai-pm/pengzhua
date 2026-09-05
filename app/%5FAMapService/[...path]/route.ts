import { env } from 'cloudflare:workers';
import { amapUpstream } from '@/lib/amap-service';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const config = env as unknown as Record<string, string | undefined>;
  if (!config.AMAP_JSAPI_KEY || !config.AMAP_SECURITY_JSCODE)
    return Response.json({ error: 'MAP_NOT_CONFIGURED' }, { status: 503 });
  const { path } = await params;
  const url = amapUpstream(
    path.join('/'),
    new URL(request.url).search,
    config.AMAP_JSAPI_KEY,
    config.AMAP_SECURITY_JSCODE,
  );
  if (!url) return new Response('Not found', { status: 404 });
  try {
    const upstream = await fetch(url.toString(), {
      redirect: 'manual',
      headers: { Referer: new URL(request.url).origin + '/' },
      signal: AbortSignal.timeout(15000),
    });
    if (upstream.status >= 300 && upstream.status < 400)
      return Response.json({ error: 'MAP_UPSTREAM_REDIRECT' }, { status: 502 });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    // Keep upstream credentials and request queries out of diagnostic logs.
    const message = error instanceof Error ? error.message : 'Unknown failure';
    console.error('AMap upstream failed', message
      .replaceAll(config.AMAP_JSAPI_KEY, '[redacted]')
      .replaceAll(config.AMAP_SECURITY_JSCODE, '[redacted]')
      .replace(/https?:\/\/\S+/g, '[upstream]'));
    return Response.json(
      { error: 'MAP_UPSTREAM_UNAVAILABLE' },
      { status: 502 },
    );
  }
}
