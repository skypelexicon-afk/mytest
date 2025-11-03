'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const StudentProfileDropdown = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (err) {
            console.warn('Logout error (ignored):', err);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="rounded-full p-0 hover:bg-transparent"
                >
                    <img
                        src="/images/user_icon.svg"
                        alt="User"
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-56 border border-gray-200 shadow-lg"
            >
                <DropdownMenuLabel className="px-4 py-2">
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link
                        href="/student/dashboard/my-enrollments"
                        className="w-full text-sm cursor-pointer"
                    >
                        Dashboard
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/student/dashboard/my-profile"
                        className="w-full text-sm cursor-pointer"
                    >
                        My Profile
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => router.push('/student/cart')}
                    className="w-full text-sm cursor-pointer"
                >
                    My Cart
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="w-full text-sm text-red-600 focus:text-red-700 cursor-pointer"
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default StudentProfileDropdown;
