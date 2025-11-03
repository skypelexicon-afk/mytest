'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { FaUserEdit } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import { MdDashboard } from 'react-icons/md';
import { FaPlusSquare } from 'react-icons/fa';
import { FaBookOpen } from 'react-icons/fa';
import { FaUserGraduate } from 'react-icons/fa';

const EducatorDashboardDropdown = ({ onClose }: { onClose: () => void }) => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (err) {
            console.warn('Logout error (ignored):', err);
        }
    };

    const menuContent = (
        <div className="flex flex-col space-y-1 p-4">
            {isMobile && (
                <>
                    <p className="text-sm font-semibold">Hi {user?.name}</p>
                    <p className="text-xs text-gray-500 mb-4">{user?.email}</p>
                    <hr className="mb-2" />
                </>
            )}

            <button
                onClick={() => {
                    router.push('/educator/dashboard/my-profile');
                    onClose();
                }}
                className="flex items-center text-sm px-2 py-2 hover:bg-gray-100 rounded"
            >
                <FaUserEdit className="mr-2 text-gray-600" />
                My Profile
            </button>

            {isMobile && (
                <>
                    <button
                        onClick={() => {
                            router.push('/educator/dashboard/');
                            onClose();
                        }}
                        className="flex items-center text-sm px-2 py-2 hover:bg-gray-100 rounded"
                    >
                        <MdDashboard className="mr-2 text-gray-600" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            router.push('/educator/dashboard/add-course');
                            onClose();
                        }}
                        className="flex items-center text-sm px-2 py-2 hover:bg-gray-100 rounded"
                    >
                        <FaPlusSquare className="mr-2 text-gray-600" />
                        Add Courses
                    </button>
                    <button
                        onClick={() => {
                            router.push('/educator/dashboard/my-courses');
                            onClose();
                        }}
                        className="flex items-center text-sm px-2 py-2 hover:bg-gray-100 rounded"
                    >
                        <FaBookOpen className="mr-2 text-gray-600" />
                        My Courses
                    </button>
                </>
            )}

            <hr className="my-1" />

            <button
                onClick={handleLogout}
                className="flex items-center text-sm text-red-600 px-2 py-2 hover:bg-gray-100 rounded"
            >
                <TbLogout className="mr-2 text-red-600" />
                Logout
            </button>
        </div>
    );

    return (
        <>
            {!isMobile && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border border-gray-200 z-50"
                >
                    {menuContent}
                </div>
            )}

            {isMobile && (
                <>
                    <div className="fixed inset-0 bg-black/20 bg-opacity-40 z-40" />
                    <div
                        ref={dropdownRef}
                        className="fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-1000 ease-in-out translate-x-0"
                    >
                        {menuContent}
                    </div>
                </>
            )}
        </>
    );
};

export default EducatorDashboardDropdown;
