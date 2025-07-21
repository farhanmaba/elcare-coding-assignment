import { ReactNode } from "react";
import { NextIntlClientProvider, useMessages } from "next-intl";
import "./globals.css";

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  // Wrap the whole application in ´NextIntlClientProvider´
  // Make the the translation messages available to all client components
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}