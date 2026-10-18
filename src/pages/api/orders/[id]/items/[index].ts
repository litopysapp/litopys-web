import type { APIRoute } from 'astro';
import { proxyApi } from '../../../../../lib/api-proxy';

// Клієнт прибирає позицію зі свого замовлення.
export const DELETE: APIRoute = async (context) => {
  const id = Number(context.params.id);
  const index = Number(context.params.index);
  if (!Number.isInteger(id) || id < 1 || !Number.isInteger(index) || index < 0) {
    return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  return proxyApi(context, 'DELETE', `/orders/${id}/items/${index}`);
};
