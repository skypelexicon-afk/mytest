'use client';
import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/useAdminDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const AllEducators: React.FC = () => {


    const { enrollmentData, dashboardData, error, fetchDashboardData } = useDashboardStore();
const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
      const [fetchError, setFetchError] = useState<string | null>(null);

    //  Protect page: Only super_admin
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/');
            } else if (user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    //  Fetch dashboard data if not already loaded
    useEffect(() => {
        if (isAuthenticated && user?.role === 'super_admin') {
            if (!enrollmentData && !dashboardData) {
                fetchDashboardData().catch((err) => {
                    console.error('Error fetching dashboard data:', err);
                    setFetchError('Failed to fetch dashboard data');
                });
            }
        }
    }, [isAuthenticated, user, enrollmentData, dashboardData, fetchDashboardData]);

    //  Loading state
    if (isLoading) {
        return <div className="p-6 text-center">Checking authentication...</div>;
    }

    //  Unauthorized while redirecting
    if (!isAuthenticated || user?.role !== 'super_admin') {
        return <div className="p-6 text-center">Unauthorized</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
            {/*Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {enrollmentData?.educatorStats.map((educator) => (
                    <div
                        key={educator.educator_id}
                        className="bg-white rounded-lg shadow-md p-4 border"
                    >
                        <div className="space-y-2">
                            
                            
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-600">
                                    Edu Id:
                                </span>
                                <span className="text-sm">
                                    {educator.educator_id}
                                </span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-600">
                                    Created Courses:
                                </span>
                                <span className="text-sm">
                                    <ul>
                                        {educator.courses.map((course, idx) => (
                                            <li key={idx}>{course.course_id} : {course.course_title}</li>
                                        ))}
                                    </ul>
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/*Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden shadow-lg table-auto">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="px-4 py-3 text-md font-medium border border-gray-500 rounded-tl-lg whitespace-nowrap">
                                Educator Id
                            </th>
                            <th className="px-4 py-3 text-md font-medium border-t border-r border-b border-gray-500 whitespace-nowrap">
                                Created Courses
                            </th>
                            <th className="px-4 py-3 text-md font-medium border-t border-r border-b border-gray-500 whitespace-nowrap">
                                Total Enrollments
                            </th>
                            <th className="px-4 py-3 text-md font-medium border-t border-r border-b border-gray-500 rounded-tr-lg whitespace-nowrap">
                                Sales
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-center bg-white">
                        {enrollmentData?.educatorStats.map(
                            (educator, index) => (
                                <tr key={educator.educator_id} className="hover:bg-gray-100">
                                    <td
                                        className={`border-l border-r border-b border-gray-300 px-4 py-3 text-md whitespace-nowrap ${index ===
                                            enrollmentData.educatorStats
                                                .length -
                                            1
                                            ? 'rounded-bl-lg'
                                            : ''
                                            }`}
                                    >
                                        {educator.educator_id}
                                    </td>
                                    <td
                                        className={`border-r border-b border-gray-300 px-4 py-3 text-md ${index ===
                                            enrollmentData.educatorStats
                                                .length -
                                            1
                                            ? 'rounded-br-lg'
                                            : ''
                                            }`}
                                    >
                                        <ul>
                                            {educator.courses.map((course, idx) => (
                                                <li key={idx}>{course.course_id} : {course.course_title}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="border-r border-b border-gray-300 px-4 py-3 text-md whitespace-nowrap">
                                        {educator.total_enrollments}
                                    </td>
                                    <td className="border-r border-b border-gray-300 px-4 py-3 text-md whitespace-nowrap">
                                        Rs. {educator.total_income}
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllEducators;
