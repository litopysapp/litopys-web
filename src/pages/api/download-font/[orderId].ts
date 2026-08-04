import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, cookies }) => {
  const token = cookies.get('litopys_token')?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });

  const tokenRes = await fetch(`https://api.litopys.win/orders/${params.orderId}/download-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const tokenData = await tokenRes.json().catch(() => null);

  if (!tokenRes.ok || !tokenData?.token) {
    return new Response('Not found', { status: tokenRes.status || 404 });
  }

  const fileRes = await fetch(`https://api.litopys.win/download/${tokenData.token}`);

  if (!fileRes.ok || !fileRes.body) {
    return new Response('Not found', { status: fileRes.status || 404 });
  }

  const headers = new Headers();
  const contentType = fileRes.headers.get('content-type');
  const contentDisposition = fileRes.headers.get('content-disposition');
  if (contentType) headers.set('content-type', contentType);
  if (contentDisposition) headers.set('content-disposition', contentDisposition);

  return new Response(fileRes.body, { status: 200, headers });
};
