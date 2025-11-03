'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCartPlus, FaGraduationCap, FaBell } from 'react-icons/fa6';
import StudentProfileDropdown from '../UserButton/StudentUB';

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';
import {
    getGeneralAnnouncements,
    GeneralAnnouncement,
} from '@/lib/api/generalAnnouncements';

const StudentNavbar = () => {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<GeneralAnnouncement[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            try {
                const data = await getGeneralAnnouncements(page, limit);
                setAnnouncements(data.announcements);
                setTotal(data.total);
            } catch (err) {
                console.error('Failed to load announcements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[40] w-[92%] max-w-7xl px-6 py-3 bg-white/20 backdrop-blur-2xl border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between">
            {/* LOGO */}
            <div
                onClick={() => router.push('/student')}
                className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition"
            >
                <Image
                    src="/images/logodi.png"
                    alt="Logo"
                    width={48}
                    height={48}
                />
                <h1
                    className="hidden sm:block text-xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#AB4918] via-[#FFC857] to-[#AB4918]"
                    style={{ fontFamily: "'Great Vibes', cursive" }}
                >
                    Happy Diwali
                </h1>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium text-sm">
                <Link
                    href="/all-courses"
                    className="hover:text-yellow-700 text-yellow-600 transition"
                >
                    All Courses
                </Link>
                <Link
                    href="/student/dashboard/my-enrollments"
                    className="hover:text-yellow-700 text-yellow-600 transition"
                >
                    My Enrollments
                </Link>
                <Link
                    href="/student/cart"
                    className="hover:text-yellow-700 text-yellow-600 transition"
                >
                    My Cart
                </Link>

                {/* 🔔 ANNOUNCEMENTS SHEET */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="relative hover:text-yellow-700 text-yellow-600 transition cursor-pointer">
                            <FaBell size={20} />
                            {total > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                    {total > 10 ? '10+' : total}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="right"
                        className="w-full sm:w-[400px] overflow-y-auto"
                    >
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold text-gray-700">
                                Announcements
                            </SheetTitle>
                        </SheetHeader>

                        {loading ? (
                            <p className="text-center text-gray-500 mt-6">
                                Loading announcements...
                            </p>
                        ) : announcements.length === 0 ? (
                            <p className="text-center text-gray-500 mt-6">
                                No announcements yet 🎉
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className={`p-4 rounded-xl border ${
                                            a.pinned
                                                ? 'border-yellow-500 bg-yellow-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <h3 className="font-semibold text-gray-800">
                                            {a.title}
                                        </h3>
                                        <p
                                            className="text-sm text-gray-600 mt-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: a.message.replace(
                                                    /\n/g,
                                                    '<br/>',
                                                ),
                                            }}
                                        />
                                        <span className="text-xs text-gray-400 mt-2 block">
                                            {new Date(
                                                a.created_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                ))}

                                {/* PAGINATION */}
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        onClick={() =>
                                                            setPage((p) =>
                                                                Math.max(
                                                                    1,
                                                                    p - 1,
                                                                ),
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </PaginationItem>

                                                <span className="text-sm text-gray-500 px-4">
                                                    Page {page} of {totalPages}
                                                </span>

                                                <PaginationItem>
                                                    <PaginationNext
                                                        onClick={() =>
                                                            setPage((p) =>
                                                                Math.min(
                                                                    totalPages,
                                                                    p + 1,
                                                                ),
                                                            )
                                                        }
                                                        className="cursor-pointer"
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        )}
                    </SheetContent>
                </Sheet>

                {/* 👤 PROFILE DROPDOWN (shadcn) */}
                <div className="flex flex-col items-center gap-1 min-w-[60px] relative">
                    <StudentProfileDropdown />
                </div>
            </nav>

            {/* MOBILE NAV */}
            <div className="md:hidden flex items-center gap-4">
                <Link
                    href="/student/cart"
                    className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer"
                >
                    <FaCartPlus size={20} className="mb-1" />
                    <span>Cart</span>
                </Link>

                <Link
                    href="/all-courses"
                    className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer"
                >
                    <FaGraduationCap size={20} className="mb-1" />
                    <span>Courses</span>
                </Link>

                {/* 🔔 Mobile Announcements */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center text-xs text-yellow-600 hover:text-yellow-700 transition cursor-pointer">
                            <FaBell size={20} className="mb-1" />
                            <span>News</span>
                        </button>
                    </SheetTrigger>

                    <SheetContent
                        side="right"
                        className="w-full sm:w-[400px] overflow-y-auto"
                    >
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold text-gray-700">
                                Announcements
                            </SheetTitle>
                        </SheetHeader>

                        {loading ? (
                            <p className="text-center text-gray-500 mt-6">
                                Loading announcements...
                            </p>
                        ) : announcements.length === 0 ? (
                            <p className="text-center text-gray-500 mt-6">
                                No announcements yet 🎉
                            </p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {announcements.map((a) => (
                                    <div
                                        key={a.id}
                                        className={`p-4 rounded-xl border ${
                                            a.pinned
                                                ? 'border-yellow-500 bg-yellow-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <h3 className="font-semibold text-gray-800">
                                            {a.title}
                                        </h3>
                                        <p
                                            className="text-sm text-gray-600 mt-1 prose max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: a.message.replace(
                                                    /\n/g,
                                                    '<br/>',
                                                ),
                                            }}
                                        />
                                        <span className="text-xs text-gray-400 mt-2 block">
                                            {new Date(
                                                a.created_at,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SheetContent>
                </Sheet>

                {/* 👤 Mobile Profile Dropdown (shadcn) */}
                <div className="flex flex-col items-center gap-1 min-w-[60px] relative">
                    <StudentProfileDropdown />
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;
