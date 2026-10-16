import type { APIRoute } from 'astro';
import { proxyOfflineLicense } from '../../../../lib/offline-license-proxy';

// Відновити файл ліцензії — той самий файл ще раз.
export const GET: APIRoute = async (context) => {
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  return proxyOfflineLicense(context, 'GET', `/offline-licenses/${id}/file`);
};
