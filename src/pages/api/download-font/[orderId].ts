import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, cookies }) => {
  const token = cookies.get('litopys_token')?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });

  const res = await fetch(`https://api.litopys.win/orders/${params.orderId}/download-font`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok || !res.body) {
    return new Response('Not found', { status: res.status || 404 });
  }

  const headers = new Headers();
  const contentType = res.headers.get('content-type');
  const contentDisposition = res.headers.get('content-disposition');
  if (contentType) headers.set('content-type', contentType);
  if (contentDisposition) headers.set('content-disposition', contentDisposition);

  return new Response(res.body, { status: 200, headers });
};
