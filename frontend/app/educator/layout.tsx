'use client';

import ClientLayout from '@/app/ClientLayout';
import { Suspense } from 'react';

export default function EducatorLayout({
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
// This layout is used for the educator section of the application.
// It wraps the children components in a Suspense component for loading states.
