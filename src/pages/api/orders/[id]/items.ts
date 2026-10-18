import type { APIRoute } from 'astro';
import { proxyApi } from '../../../../lib/api-proxy';

// Клієнт дозамовляє товар у своє замовлення (ціну визначає сервер).
export const POST: APIRoute = async (context) => {
  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id < 1) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
  const body = await context.request.json().catch(() => ({}));
  return proxyApi(context, 'POST', `/orders/${id}/items`, {
    id: String(body?.id ?? ''),
    qty: Number(body?.qty) || 1,
  });
};
