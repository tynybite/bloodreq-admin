'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  locales, 
  type Locale, 
  localeNames, 
  localeFlags,
  currencies,
  type Currency,
  currencySymbols,
  currencyNames,
  localeCurrencies,
} from '@/i18n/config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: typeof locales;
  localeNames: typeof localeNames;
  localeFlags: typeof localeFlags;
  // Currency
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: typeof currencies;
  currencySymbols: typeof currencySymbols;
  currencyNames: typeof currencyNames;
  formatCurrency: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  initialLocale = 'en' 
}: { 
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<Currency>(localeCurrencies[initialLocale]);
  const router = useRouter();

  const setLocale = useCallback(async (newLocale: Locale) => {
    // Set cookie via API
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });
    
    setLocaleState(newLocale);
    // Auto-change currency based on locale
    setCurrencyState(localeCurrencies[newLocale]);
    router.refresh();
  }, [router]);

  const setCurrency = useCallback(async (newCurrency: Currency) => {
    // Optionally persist currency preference
    await fetch('/api/currency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: newCurrency }),
    }).catch(() => {}); // Ignore if API doesn't exist yet

    setCurrencyState(newCurrency);
  }, []);

  // Format currency helper
  const formatCurrency = useCallback((amount: number) => {
    const symbol = currencySymbols[currency];
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${symbol}${formatted}`;
  }, [currency, locale]);

  return (
    <LanguageContext.Provider value={{ 
      locale, 
      setLocale, 
      locales, 
      localeNames, 
      localeFlags,
      currency,
      setCurrency,
      currencies,
      currencySymbols,
      currencyNames,
      formatCurrency,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
