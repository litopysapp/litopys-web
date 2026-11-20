// Партнери — той самий список, що на litograph.pro/partnery/
// (у D:\LitoGraph: site/data.js, PARTNERS). Новий партнер — додати в обидва,
// а його іконку (PNG без фону) — у public/partners/ тут і site/static/img/partners/ там.
export interface Partner {
  id: string;
  name: string;
  domain: string;
  url: string;
  about: string;
  // Один рядок для каруселі на головній.
  short: string;
  topics: string[];
  // Іконка партнера без фону (шлях від кореня сайту).
  icon: string;
  // Фон кола під іконкою в картках (якщо немає — popup.circle або кремовий).
  markBg?: string;
  // Плашка в правому нижньому куті (public/partner-popup.js) — лише для партнерів,
  // яким її окремо погодили. Без popup — плашки немає, лише картки й карусель.
  popup?: {
    title: string;
    subtitle: string;
    bg: string;     // фон плашки — основний колір партнера
    fg: string;     // текст
    circle: string; // коло під іконкою
  };
}

export const PARTNERS: Partner[] = [
  {
    id: 'opora',
    name: 'Опора',
    domain: 'A0000.com.ua',
    url: 'https://a0000.com.ua/',
    about: 'Незалежний інформаційний проєкт для військовослужбовців України: зрозумілі відповіді на питання служби з посиланнями на нормативні документи.',
    short: 'Відповіді на питання військової служби: ВЛК, виплати, відпустки, документи.',
    topics: ['ВЛК', 'Грошове забезпечення', 'Відпустки', 'Документи', 'Проходження служби'],
    icon: '/partners/opora.png',
    popup: {
      title: 'Опора — питання військової служби',
      subtitle: 'Партнер Літопису · A0000.com.ua',
      bg: '#304736',
      fg: '#f7f6f1',
      circle: '#f7f6f1',
    },
  },
  {
    id: 'palne',
    name: 'Пальне UA',
    domain: '20.com.ua',
    url: 'https://20.com.ua/',
    about: 'Актуальні ціни на бензин, дизель і автогаз на АЗС України: порівняння мереж, ціни по областях і містах, карта АЗС і калькулятор заправки.',
    short: 'Ціни на бензин, дизель і автогаз на АЗС України сьогодні.',
    topics: ['Ціни на АЗС', 'Бензин і дизель', 'Автогаз', 'Карта АЗС', 'Калькулятор заправки'],
    icon: '/partners/palne.png',
    markBg: '#22d383',
  },
];

// Фон кола під іконкою партнера в картках.
export const markBg = (p: Partner) => p.markBg ?? p.popup?.circle ?? '#f7f6f1';

// Дані для public/partner-popup.js: партнери з плашкою, у порядку списку.
export const PARTNER_POPUPS = PARTNERS.filter((p) => p.popup).map((p) => ({
  id: p.id,
  url: p.url,
  icon: p.icon,
  ...p.popup!,
}));
