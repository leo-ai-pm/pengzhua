import { env } from 'cloudflare:workers';
export async function GET() {
  const config = env as unknown as Record<string, string | undefined>;
  const ready = !!config.AMAP_JSAPI_KEY && !!config.AMAP_SECURITY_JSCODE;
  // The browser key is public by design. The security code stays in the Worker.
  return Response.json(
    { configured: ready, key: ready ? config.AMAP_JSAPI_KEY : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
