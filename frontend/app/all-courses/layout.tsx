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
            <ClientLayout>
                <div className="pt-25">{children}</div>
            </ClientLayout>
        </Suspense>
    );
}
