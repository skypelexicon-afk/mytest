'use client';
import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import EducatorNav from '@/components/Navbar/EducatorNav';
import GuestNav from '@/components/Navbar/GuestNav';
import LoginModal from '@/components/LandingComponents/LoginModal';
import SignupModal from '@/components/LandingComponents/SignupModal';
import Footer from '@/components/LandingComponents/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import LayoutWrapper from '@/components/LayoutWrapper';
import AdminDashboardNav from '@/components/Navbar/DashboardNav/AdminDashNav';
import ForgotPasswordModal from '@/components/LandingComponents/ForgotPasswordModal';
import { useRouter } from 'next/navigation';
import router from 'next/dist/shared/lib/router/router';
import EducatorDashboardNav from '@/components/Navbar/DashboardNav/EducatorDashNav';
import AdminNavbar from '@/components/Navbar/AdminNav';
import StudentDashboardNav from '@/components/Navbar/DashboardNav/StudentDashNav';
import StudentNavbar from '@/components/Navbar/StudentNav';
import StreakWidget from '@/components/StreakWidget';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, hasHydrated, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const showLoginModal = searchParams.get('login') === 'true';
    const showSignupModal = searchParams.get('signup') === 'true';
    const showForgotPasswordModal =
        searchParams.get('forgot-password') === 'true';

    useEffect(() => {
        // If user is not logged in but is marked as authenticated, fetch user
        if (!user && isAuthenticated) {
            useAuthStore.getState().fetchUser();
        }

        // If authenticated and on "/", redirect to role-specific dashboard
        if (pathname === '/' && user?.role) {
            if (user.role === 'student') router.push('/student');
            else if (user.role === 'educator') router.push('/educator');
            else if (user.role === 'super_admin') router.push('/admin');
        }

        // If on a dashboard route but user doesn't match role, redirect to home
        // if (
        //     pathname.startsWith('/student') &&
        //     user?.role !== 'student'
        // ) {
        //     router.push('/');
        // }
        // if (
        //     pathname.startsWith('/educator') &&
        //     user?.role !== 'educator'
        // ) {
        //     router.push('/');
        // }
        // if (
        //     pathname.startsWith('/admin') &&
        //     user?.role !== 'super_admin'
        // ) {
        //     router.push('/');
        // }
    }, [user, isAuthenticated, pathname]);

    useEffect(() => {
        document.body.style.overflow =
            pathname === '/login' ? 'hidden' : 'auto';
    }, [pathname]);

    if (!hasHydrated) return null;

    const isStudentDashboard = pathname.startsWith('/student/dashboard');
    const isEducatorDashboard = pathname.startsWith('/educator/dashboard');
    const isAdminDashboard = pathname.startsWith('/admin/dashboard');

    if (isStudentDashboard && user?.role === 'student') {
        return (
            <>
                <StudentDashboardNav>
                    {children}
                    {showLoginModal && <LoginModal />}
                    {showSignupModal && <SignupModal />}
                </StudentDashboardNav>
                <Footer />
                <StreakWidget userId={user?.id} />
            </>
        );
    }

    if (isEducatorDashboard && user?.role === 'educator') {
        return (
            <>
                <EducatorDashboardNav>
                    {children}
                    {showLoginModal && <LoginModal />}
                    {showSignupModal && <SignupModal />}
                </EducatorDashboardNav>
                <Footer />
            </>
        );
    }

    if (isAdminDashboard && user?.role === 'super_admin') {
        return (
            <>
                <AdminDashboardNav>
                    {children}
                    {showLoginModal && <LoginModal />}
                    {showSignupModal && <SignupModal />}
                </AdminDashboardNav>
                <Footer />
            </>
        );
    }

    const renderNavComponent = () => {
        if (user?.role === 'student') return <StudentNavbar />;
        if (user?.role === 'educator') return <EducatorNav />;
        if (user?.role === 'super_admin') return <AdminNavbar />;
        return <GuestNav />;
    };

    return (
        <>
            {!isAdminDashboard &&
                !isEducatorDashboard &&
                !isStudentDashboard && <header>{renderNavComponent()}</header>}

            <LayoutWrapper>{children}</LayoutWrapper>
            <Footer />
            {showLoginModal && <LoginModal />}
            {showSignupModal && <SignupModal />}
            {showForgotPasswordModal && <ForgotPasswordModal />}
            {user?.role === 'student' && <StreakWidget userId={user?.id} />}
        </>
    );
}
