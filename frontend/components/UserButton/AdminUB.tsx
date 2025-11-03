'use client';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export const AdminProfileDropdown = ({ onClose }: { onClose: () => void }) => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const dropdownRef = useRef<HTMLDivElement>(null);

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
        } finally {
            onClose();
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border border-gray-200 z-50 cursor-default"
        >
            <div className="px-4 py-2">
                <p className="font-semibold text-sm">{user?.name || ''}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
            <hr className="my-1" />
            <button
                onClick={() => {
                    router.push('/admin/dashboard');
                    onClose();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
                Dashboard
            </button>
            <hr className="my-1" />
            <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 cursor-pointer"
            >
                Logout
            </button>
        </div>
    );
};
