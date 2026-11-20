// Партнери — той самий список, що на litograph.pro/partnery/
// (у D:\LitoGraph: site/data.js, PARTNERS). Новий партнер — додати в обидва,
// а його іконку (PNG без фону) — у public/partners/ тут і site/static/img/partners/ там.
export interface Partner {
  id: string;
  name: string;
  domain: string;
  url: string;
  about: string;
  topics: string[];
  // Іконка партнера без фону (шлях від кореня сайту).
  icon: string;
  // Плашка в правому нижньому куті (public/partner-popup.js). Без popup — не показується.
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
];

// Дані для public/partner-popup.js: партнери з плашкою, у порядку списку.
export const PARTNER_POPUPS = PARTNERS.filter((p) => p.popup).map((p) => ({
  id: p.id,
  url: p.url,
  icon: p.icon,
  ...p.popup!,
}));
