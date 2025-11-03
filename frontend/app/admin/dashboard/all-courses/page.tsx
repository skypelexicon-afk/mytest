'use client';
import React, { useState, useEffect } from 'react';
// import { getAllCoursesAdmin } from '@/lib/api/Courses';
// import { Course } from '@/lib/types/courseType';
// import { formatDateWithSuffix } from '@/lib/utils/dateFormatter';
import { fetchApi } from '@/lib/doFetch';
import { useDashboardStore } from '@/store/useAdminDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface Enrollment {
    course_id: number;
    course_title: string;
    bundle_count: number;
    direct_count: number;
    total_amount: number;
}

interface Props {
    enrollmentData: {
        enrollments: Enrollment[];
    };
}

export default function AdminAllCourses() {
    const {
        enrollmentData,
        allCourses,
        dashboardData,
        error,
        fetchDashboardData,
    } = useDashboardStore();
    const [courseData, setCourseData] = useState<Props | null>(null);
    // const [error, setError] = useState<string | null>(null);
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    //  Protect route
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/');
            } else if (user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    // Fetch data if not already loaded
    useEffect(() => {
        if (isAuthenticated && user?.role === 'super_admin') {
            if (!enrollmentData && !dashboardData) {
                fetchDashboardData().catch((err) => {
                    console.error('Error fetching dashboard data:', err);
                });
            }
            let totalIncome = 0;
            enrollmentData?.enrollments.forEach((course) => {
                totalIncome += course.total_amount;
            });
            console.log(totalIncome);
        }
    }, [
        isAuthenticated,
        user,
        allCourses,
        enrollmentData,
        dashboardData,
        fetchDashboardData,
    ]);

    const handleToggleCourse = async (
        courseId: number,
        currentState: boolean,
    ) => {
        try {
            await fetchApi.put(`api/courses/toggleCourseStatus/${courseId}`, {
                is_active: !currentState,
            });
            await fetchDashboardData(); // Refresh after update
        } catch (err) {
            console.error('Error toggling course status:', err);
        }
    };

    //  Loading state
    if (isLoading) {
        return (
            <div className="p-6 text-center">Checking authentication...</div>
        );
    }

    //  Unauthorized (while redirecting)
    if (!isAuthenticated || user?.role !== 'super_admin') {
        return <div className="p-6 text-center">Unauthorized</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
            <table className="border-separate border-spacing-0 rounded-lg overflow-hidden shadow-lg h-fit">
                <thead className="bg-gray-300">
                    <tr>
                        <th className="px-2 py-2 sm:px-4 text-xs sm:text-sm border border-gray-500 rounded-tl-lg">
                            Course ID
                        </th>
                        <th className="px-2 py-2 sm:px-4 text-xs sm:text-sm border-t border-r border-b border-gray-500">
                            Course Name
                        </th>
                        <th className="px-2 py-2 sm:px-4 text-xs sm:text-sm border-t border-r border-b border-gray-500">
                            Sales
                        </th>
                        <th className="px-2 py-2 sm:px-4 text-xs sm:text-sm border-t border-r border-b border-gray-500 rounded-tr-lg">
                            Bundle_Count
                        </th>
                        <th className="px-2 py-2 sm:px-4 text-xs sm:text-sm border-t border-r border-b border-gray-500 rounded-tr-lg">
                            Direct_Count
                        </th>
                        <th className="px-2 py-2 sm:px-4 text-xs sm:text-sm border-t border-r border-b border-gray-500 rounded-tr-lg">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="text-center bg-white">
                    {allCourses?.map((course, index) => (
                        <tr key={course.id} className="hover:bg-gray-100">
                            <td
                                className={`border-l border-r border-b border-gray-300 px-2 py-2 sm:px-4 text-xs sm:text-sm ${
                                    index === allCourses.length - 1
                                        ? 'rounded-bl-lg'
                                        : ''
                                }`}
                            >
                                {course.id}
                            </td>
                            <td className="border-r border-b border-gray-300 px-2 py-2 sm:px-4 text-xs sm:text-sm">
                                {course.title}
                            </td>
                            <td className="border-r border-b border-gray-300 px-2 py-2 sm:px-4 text-xs sm:text-sm">
                                ₹
                                {course.total_amount.toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </td>
                            <td className="border-r border-b border-gray-300 px-2 py-2 sm:px-4 text-xs sm:text-sm">
                                {course.bundle_count}
                            </td>
                            <td className="border-r border-b border-gray-300 px-2 py-2 sm:px-4 text-xs sm:text-sm">
                                {course.direct_count}
                            </td>
                            <td className="border-r border-b border-gray-300 px-2 py-2 sm:px-4 text-xs sm:text-sm">
                                <button
                                    onClick={() =>
                                        handleToggleCourse(
                                            course.id,
                                            course.is_active,
                                        )
                                    }
                                    className={`px-3 py-1 rounded text-white text-xs ${
                                        course.is_active
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                                >
                                    {course.is_active
                                        ? 'Deactivate'
                                        : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
