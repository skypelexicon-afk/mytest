'use client';

import ClientLayout from '@/app/ClientLayout';
import { Suspense } from 'react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClientLayout>{children}</ClientLayout>
        </Suspense>
    );
}
