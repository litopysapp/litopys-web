import type { APIRoute } from 'astro';
import { proxyOfflineLicense } from '../../../../lib/offline-license-proxy';

// Перегенерувати файл ліцензії за новим кодом ПК (той самий ПК: плата + процесор).
export const POST: APIRoute = async (context) => {
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  const body = await context.request.json().catch(() => ({}));
  return proxyOfflineLicense(context, 'POST', `/offline-licenses/${id}/regenerate`, {
    request: String(body?.request ?? ''),
  });
};
