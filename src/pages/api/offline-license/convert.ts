import type { APIRoute } from 'astro';
import { proxyOfflineLicense } from '../../../lib/offline-license-proxy';

// Перетворення ліцензії (місця) seat в офлайн: код ПК + згода з умовами.
export const POST: APIRoute = async (context) => {
  const body = await context.request.json().catch(() => ({}));
  const seat = Number(body?.seat);
  if (!Number.isInteger(seat) || seat < 1) return Response.json({ ok: false, error: 'seat_not_found' }, { status: 400 });
  return proxyOfflineLicense(context, 'POST', `/licenses/seats/${seat}/offline`, {
    request: String(body?.request ?? ''),
    termsVersion: String(body?.termsVersion ?? ''),
    accepted: body?.accepted === true,
  });
};
