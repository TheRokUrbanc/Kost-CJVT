import { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { IBM_Plex_Sans } from "next/font/google";
import { redirect } from "next/navigation";
import Footer from "@/app/[locale]/Footer";
import Providers from "@/app/[locale]/Providers";
import "@/design-system/styles/index.css";
import { locales } from "@/navigation";
import "../globals.css";

const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
    title: "Kost",
    description: "Korpus slovenščine kot tujega jezika",
};

interface RootLayoutProps {
    children: ReactNode;
    params: {
        locale: string;
    };
}

export default function RootLayout({ children, params }: RootLayoutProps) {
    const { locale } = params;
    if (!locales.includes(locale as any)) redirect("/sl");
    // Receive messages provided in `i18n.ts`
    const messages = useMessages();

    return (
        <html lang={locale} className={ibmPlexSans.className}>
            <body>
                <Providers>
                    <NextIntlClientProvider timeZone="Europe/Ljubljana" locale={locale} messages={messages}>
                        {children}
                        <Footer />
                    </NextIntlClientProvider>
                </Providers>
            </body>
        </html>
    );
}
