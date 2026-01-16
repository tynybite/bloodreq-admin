import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'bn', 'hi', 'de', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  // Get locale from cookie or default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  
  let locale: Locale = defaultLocale;
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
