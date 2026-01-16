export const locales = ['en', 'bn', 'hi', 'de', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
  hi: 'हिंदी',
  de: 'Deutsch',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  bn: '🇧🇩',
  hi: '🇮🇳',
  de: '🇩🇪',
  fr: '🇫🇷',
};

// Currency configuration
export const currencies = ['USD', 'BDT', 'INR', 'EUR'] as const;
export type Currency = (typeof currencies)[number];

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  BDT: '৳',
  INR: '₹',
  EUR: '€',
};

export const currencyNames: Record<Currency, string> = {
  USD: 'US Dollar',
  BDT: 'Bangladeshi Taka',
  INR: 'Indian Rupee',
  EUR: 'Euro',
};

// Default currency based on locale
export const localeCurrencies: Record<Locale, Currency> = {
  en: 'USD',
  bn: 'BDT',
  hi: 'INR',
  de: 'EUR',
  fr: 'EUR',
};

export const defaultLocale: Locale = 'en';
export const defaultCurrency: Currency = 'USD';
