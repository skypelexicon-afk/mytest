'use client';

import { useEffect } from 'react';

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        document.body.style.overflow = '';
    }, []);

    return <>{children}</>;
}
