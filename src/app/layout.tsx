import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { Locale } from "@/i18n/config";
import "./globals.css";

export const metadata = {
  title: "BloodReq - Save Lives, One Drop at a Time",
  description: "Connect blood donors with patients in need. Real-time matching, verified requests, and a community that saves lives every day.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale() as Locale;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider initialLocale={locale}>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange
              >
                {children}
                <Toaster />
            </ThemeProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
