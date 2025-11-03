'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { FaChevronLeft } from 'react-icons/fa';
import AdminDashboardDropdown from '@/components/UserButton/AdminDashUB';

export default function EducatorDashTopbar() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    if (!hasHydrated || !user?.role) return null;

    const routeLabelMap: Record<string, string> = {
        '/admin/dashboard/my-profile': 'My Profile',
        '/admin/dashboard/all-students': 'All Students',
        '/admin/dashboard/all-educators': 'All Educators',
        '/admin/dashboard/all-courses': 'All Courses',
        '/admin/dashboard/all-transactions': 'All Transactions',
        '/admin/dashboard/analytics': 'Analytics',
    };
    const currentTabLabel = routeLabelMap[pathname] || 'Dashboard';
    return (
        <>
            <div className="flex flex-row shadow-md bg-white border-b-1 border-gray-300 px-8 py-4 items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="cursor-pointer bg-white rounded-md px-2 py-2 flex items-center gap-2 hover:bg-gray-200 transition duration-200 shadow-md"
                >
                    <FaChevronLeft
                        className="inline font-semibold text-gray-600"
                        size={16}
                    />
                    <span className="hidden md:block ">Back</span>
                </button>
                <div className="text-medium md:text-xl font-bold text-gray-800">
                    {currentTabLabel}
                </div>
                <div className="flex items-center gap-4 justify-end">
                    <p className="text-medium md:text-lg font-bold text-gray-800">
                        Hi, {user?.name?.split(' ')[0]}
                    </p>
                    <button
                        className="cursor-pointer"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        <Image
                            src="/images/user_icon.svg"
                            alt="User"
                            width={40}
                            height={40}
                        />
                    </button>
                </div>
                {isDropdownOpen && (
                    <div className="absolute top-12 right-4 z-50">
                        <AdminDashboardDropdown
                            onClose={() => setIsDropdownOpen(false)}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
