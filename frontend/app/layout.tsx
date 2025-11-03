import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { Suspense } from 'react';
import GlobalLoader from '@/components/GlobalLoader';
import CourseBoughtPopup from '@/components/CourseBoughtPopup';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://tendingtoinfinityacademy.com',
    ),
    title: 'Tending To Infinity',
    description:
        'Empower your future with the courses designed to fit your choice.',
    icons: {
        icon: '/images/logo.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="overflow-x-hidden min-h-screen">
                <GlobalLoader />
                <Toaster richColors position="bottom-right" />
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="beforeInteractive"
                />
                <CourseBoughtPopup />
            </body>
        </html>
    );
}
