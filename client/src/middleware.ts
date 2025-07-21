import createMiddleware from 'next-intl/middleware';

// Make sure that URLs are prefixed with a locale
export default createMiddleware({
  locales: ['en'],
  defaultLocale: 'en'
});
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|react.svg).*)']
};