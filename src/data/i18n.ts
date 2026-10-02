export type Locale = 'en' | 'vi';
export const LOCALES: Locale[] = ['en', 'vi'];

export const SITE_URL = 'https://www.mtrobotix.com';

/** Page keys → English paths (always with trailing slash, matching the sitemap). Vietnamese: same under /vi. */
export const ROUTES = {
  home: '/',
  mtrq: '/mtr-q/',
  amr: '/amr/',
  arm: '/robot-arm/',
  about: '/about/',
  contact: '/contact/',
} as const;
export type RouteKey = keyof typeof ROUTES;

/**
 * Pages hidden from nav, footer, home cards and sitemap. Their URLs redirect to home (astro.config.mjs).
 * To show one again: remove it here, restore src/pages/<page>.astro + src/pages/vi/<page>.astro,
 * and delete its redirect.
 */
export const HIDDEN: RouteKey[] = ['arm'];
export const isShown = (key: RouteKey) => !HIDDEN.includes(key);

export function localPath(locale: Locale, key: RouteKey): string {
  const path = ROUTES[key];
  if (locale === 'en') return path;
  return path === '/' ? '/vi/' : `/vi${path}`;
}

/** Real company facts. Source: MTR-Q one-pager (2026). Change here only. */
export const COMPANY = {
  name: 'MTRobotix',
  email: 'mtrobotix@gmail.com',
  phones: [
    { label: { en: 'Vietnam', vi: 'Việt Nam' }, display: '+84 835760735', tel: '+84835760735' },
    { label: { en: 'Canada', vi: 'Canada' }, display: '+1 905 924 5498', tel: '+19059245498' },
  ],
  locations: [
    { en: 'Ho Chi Minh City, Vietnam', vi: 'TP. Hồ Chí Minh, Việt Nam', short: 'HCMC, VN' },
    { en: 'Toronto, Ontario, Canada', vi: 'Toronto, Ontario, Canada', short: 'Toronto, ON, CA' },
  ],
  linkedin: 'https://www.linkedin.com/in/thonghuynh1/',
} as const;

export const ui = {
  en: {
    nav: { home: 'Home', mtrq: 'MTR-Q', amr: 'MTR-M', arm: 'Robot arm', about: 'About', contact: 'Contact us' },
    homeLabel: 'MTRobotix home',
    primaryNav: 'Main',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    skip: 'Skip to content',
    backToTop: 'Back to top',
    wip: 'Demo · Work in progress',
    comingSoon: 'Details coming soon',
    learnMore: 'Learn more',
    footerProducts: 'Products',
    footerCompany: 'Company',
    footerContact: 'Contact',
    rights: 'All rights reserved.',
  },
  vi: {
    nav: { home: 'Trang chủ', mtrq: 'MTR-Q', amr: 'MTR-M', arm: 'Cánh tay robot', about: 'Giới thiệu', contact: 'Liên hệ' },
    homeLabel: 'Trang chủ MTRobotix',
    primaryNav: 'Chính',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    language: 'Ngôn ngữ',
    skip: 'Bỏ qua đến nội dung',
    backToTop: 'Lên đầu trang',
    wip: 'Demo · Đang phát triển',
    comingSoon: 'Thông tin chi tiết sắp có',
    learnMore: 'Xem thêm',
    footerProducts: 'Sản phẩm',
    footerCompany: 'Công ty',
    footerContact: 'Liên hệ',
    rights: 'Bảo lưu mọi quyền.',
  },
} as const;
