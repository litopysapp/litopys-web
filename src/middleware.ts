import { defineMiddleware } from 'astro:middleware';

const PROTECTED = ['/dashboard', '/koshyk', '/oformlennia'];

const VISITOR_COOKIE = 'litopys_vid';
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 730; // 2 роки

function shouldTrack(pathname: string, request: Request) {
  if (request.method !== 'GET') return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/dashboard')) return false;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false; // статичні файли (assets, favicon...)
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

function trackVisit(context: Parameters<Parameters<typeof defineMiddleware>[0]>[0]) {
  let visitorId = context.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    context.cookies.set(VISITOR_COOKIE, visitorId, {
      path: '/',
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
  }

  // Fire-and-forget: не чекаємо відповіді, щоб не сповільнювати рендер сторінки.
  fetch('https://api.litopys.win/track/visit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': context.clientAddress ?? '',
    },
    body: JSON.stringify({
      visitorId,
      path: context.url.pathname,
      referrer: context.request.headers.get('referer') ?? '',
    }),
  }).catch(() => {});
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (shouldTrack(pathname, context.request)) {
    try {
      trackVisit(context);
    } catch {}
  }

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return next();

  const token = context.cookies.get('litopys_token')?.value;
  if (!token) return context.redirect(`/login?next=${encodeURIComponent(pathname)}`);

  try {
    const res = await fetch('https://api.litopys.win/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      context.cookies.delete('litopys_token', { path: '/' });
      return context.redirect('/login');
    }
    const data = await res.json();
    context.locals.user = data.user;
    context.locals.license = data.license;
  } catch {
    return context.redirect('/login');
  }

  return next();
});
