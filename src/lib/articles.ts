// Статті розділу /statti: список для сторінки-переліку, карти сайту й блоку
// «Читайте також». Порядок — від новіших до старіших.
export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tag: string;
}

export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'yak-stvoryty-shryft-zi-svoho-pocherku',
    title: 'Як створити шрифт зі свого почерку: покрокова інструкція',
    description: 'Від порожнього шаблону до готового шрифту .ttf: що писати, чим сканувати, як прибрати зайві штрихи й налаштувати відступи. З українськими літерами.',
    date: '2026-10-22',
    tag: 'LitoGraph',
  },
  {
    slug: 'plotter-pyshe-ruchkoiu',
    title: 'Плотер, що пише ручкою: як це працює',
    description: 'Як звичайний плотер Silhouette Portrait 4 пише текст справжньою ручкою вашим почерком: що потрібно, як підготувати документ і чим це відрізняється від друку.',
    date: '2026-10-22',
    tag: 'Літопис',
  },
  {
    slug: 'bezkoshtovni-rukopysni-shryfty',
    title: 'Безкоштовні рукописні шрифти з українськими літерами',
    description: 'Сім вільних рукописних шрифтів з ґ, є, і, ї та апострофом: як виглядають, для чого підходять і де їх безкоштовно спробувати.',
    date: '2026-10-22',
    tag: 'Шрифти',
  },
  {
    slug: 'zhurnaly-vid-ruky-bez-mozoliv',
    title: 'ЖБД і ЖОВтР від руки: як вести журнали швидше',
    description: 'Журнали, які мають бути написані від руки, забирають години. Як організувати записи, зберегти один почерк на всіх сторінках і доручити писанину плотеру.',
    date: '2026-10-22',
    tag: 'Літопис',
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);

export function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}
