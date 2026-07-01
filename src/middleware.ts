import { defineMiddleware } from 'astro:middleware';

const PROTECTED = ['/dashboard'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return next();

  const token = context.cookies.get('litopys_token')?.value;
  if (!token) return context.redirect('/login');

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
