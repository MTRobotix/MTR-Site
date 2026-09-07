export type Locale = 'en' | 'vi';

export const ui = {
  en: {
    home: 'Home',
    solutions: 'Solutions',
    about: 'About us',
    requestDemo: 'Request a demo',
    support: 'Support',
    company: 'Company',
    contact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    primaryNav: 'Primary navigation',
    mobileNav: 'Mobile navigation',
    siteNav: 'Site navigation',
    productSolutions: 'Product solutions',
    homeLabel: 'MTRobotics home',
    utilityLabel: 'MTRobotics locations and utilities',
    specification: 'Specification',
    measuredSpecifications: 'measured specifications',
    technicalFigure: 'technical figure',
    inAction: 'In action',
    pauseLoop: 'Pause in-action loop',
    playLoop: 'Play in-action loop',
    skip: 'Skip to main content',
  },
  vi: {
    home: 'Trang chủ',
    solutions: 'Giải pháp',
    about: 'Về chúng tôi',
    requestDemo: 'Yêu cầu demo',
    support: 'Hỗ trợ',
    company: 'Công ty',
    contact: 'Liên hệ',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    primaryNav: 'Điều hướng chính',
    mobileNav: 'Điều hướng di động',
    siteNav: 'Điều hướng trang',
    productSolutions: 'Các giải pháp sản phẩm',
    homeLabel: 'Trang chủ MTRobotics',
    utilityLabel: 'Địa điểm và tiện ích MTRobotics',
    specification: 'Thông số kỹ thuật',
    measuredSpecifications: 'thông số đo lường',
    technicalFigure: 'hình kỹ thuật',
    inAction: 'Đang vận hành',
    pauseLoop: 'Tạm dừng video vận hành',
    playLoop: 'Phát video vận hành',
    skip: 'Bỏ qua đến nội dung chính',
  },
} as const;

export function localPath(locale: Locale, path: string) {
  if (locale === 'en') return path;
  if (path === '/') return '/vi/';
  return `/vi${path}`;
}

export function alternatePath(locale: Locale, currentPath: string) {
  if (locale === 'vi') return currentPath.replace(/^\/vi(?=\/|$)/, '') || '/';
  return currentPath === '/' ? '/vi/' : `/vi${currentPath}`;
}
