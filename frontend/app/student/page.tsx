'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import LandingPage from '@/components/LandingComponents/LandingPage';

export default function StudentHome() {
    const { isAuthenticated, hasHydrated, fetchUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (hasHydrated) {
            fetchUser();
        }
    }, [hasHydrated]);

    useEffect(() => {
        if (!hasHydrated) return;

        if (!isAuthenticated) {
            router.replace('/');
        }
    }, [hasHydrated, isAuthenticated]);

    return isAuthenticated ? <LandingPage /> : null;
}
