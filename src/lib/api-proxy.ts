// Проксі кабінету до API сервера з токеном із cookie litopys_token.
// JSON-відповідь API повертається як є (разом зі статусом).
import type { APIContext } from 'astro';

const API = 'https://api.litopys.win';

export async function proxyApi(
  context: APIContext,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<Response> {
  const token = context.cookies.get('litopys_token')?.value;
  if (!token) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ ok: false, error: 'bad_response' }));
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ ok: false, error: 'network' }, { status: 502 });
  }
}
