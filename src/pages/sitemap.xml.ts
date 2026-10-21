import type { APIRoute } from 'astro';

// Карта сайту для Google/Bing: лише публічні сторінки (кабінет, кошик і
// сторінки входу сюди не входять — вони мають noindex у Layout).
const SITE = 'https://litopys.pro';
const PAGES: { path: string; priority: number; changefreq: string }[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/litopys', priority: 0.9, changefreq: 'weekly' },
  { path: '/litopys/funktsii', priority: 0.8, changefreq: 'monthly' },
  { path: '/litopys/yak-pratsyuye', priority: 0.8, changefreq: 'monthly' },
  { path: '/litopys/shcho-potribno', priority: 0.7, changefreq: 'monthly' },
  { path: '/litopys/shrifty', priority: 0.8, changefreq: 'monthly' },
  { path: '/litopys/demo', priority: 0.7, changefreq: 'monthly' },
  { path: '/tsiny', priority: 0.9, changefreq: 'weekly' },
  { path: '/litoscan', priority: 0.8, changefreq: 'monthly' },
  { path: '/litograph', priority: 0.8, changefreq: 'monthly' },
  { path: '/zavantazhennia', priority: 0.8, changefreq: 'weekly' },
  { path: '/register', priority: 0.5, changefreq: 'yearly' },
  { path: '/umovy-vykorystannia', priority: 0.3, changefreq: 'yearly' },
  { path: '/pravyla-oflain-litsenzii', priority: 0.3, changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map((p) => `  <url><loc>${SITE}${p.path === '/' ? '/' : p.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority.toFixed(1)}</priority></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
