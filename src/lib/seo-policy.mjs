export const pagePaths = {
  home: '/',
  mobileMassage: '/mobile-massage/',
  directBilling: '/direct-billing/',
  blog: '/blog/',
  gallery: '/gallery/',
  contact: '/contact/',
  giftCertificate: '/giftcertificate/',
  booking: '/booking/',
};

export const noindexPaths = [
  '/about/',
  '/reviews/',
  '/projects/',
  '/projects/project-1/',
  '/projects/project-2/',
  '/gallery/inside/',
  '/gallery/client/',
  '/gallery/events/',
];

export function normalizePathname(pathname) {
  const path = pathname.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, '');
  return path ? `/${path}/` : '/';
}

export function isIndexablePath(pathname) {
  const path = normalizePathname(pathname);
  return (
    !noindexPaths.includes(path) &&
    !/^\/(?:admin|dev|og)(?:\/|$)/.test(path) &&
    path !== '/book/'
  );
}
