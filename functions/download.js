export async function onRequestGet() {
  const upstream = await fetch('https://api.litopys.win/download');
  if (!upstream.ok) {
    return new Response('Файл тимчасово недоступний', { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="litopys.exe"',
      'Content-Length': upstream.headers.get('Content-Length') ?? '',
    },
  });
}
