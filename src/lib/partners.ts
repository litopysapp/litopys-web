// Партнери — той самий список, що на litograph.pro/partnery/
// (у D:\LitoGraph: site/data.js, PARTNERS). Новий партнер — додати в обидва.
export interface Partner {
  name: string;
  domain: string;
  url: string;
  about: string;
  topics: string[];
}

export const PARTNERS: Partner[] = [
  {
    name: 'Опора',
    domain: 'A0000.com.ua',
    url: 'https://a0000.com.ua/',
    about: 'Незалежний інформаційний проєкт для військовослужбовців України: зрозумілі відповіді на питання служби з посиланнями на нормативні документи.',
    topics: ['ВЛК', 'Грошове забезпечення', 'Відпустки', 'Документи', 'Проходження служби'],
  },
];
