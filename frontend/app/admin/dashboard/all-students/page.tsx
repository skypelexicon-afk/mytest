'use client';
import React, { useState, useEffect } from 'react';
import { fetchData } from '@/lib/api/adminData';
import { DashboardData } from '@/lib/types/adminDataType';
import { useDashboardStore } from '@/store/useAdminDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const AllStudents: React.FC = () => {
    const { dashboardData, fetchDashboardData } = useDashboardStore();
    // const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    //     null,
    // );

     const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
    const [error, setError] = useState<string | null>(null);

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

  // Fetch dashboard data if not already loaded
  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      if (!dashboardData) {
        fetchDashboardData().catch((err) => {
          console.error('Error fetching dashboard data:', err);
          setError('Failed to fetch dashboard data');
        });
      }
    }
  }, [isAuthenticated, user, dashboardData, fetchDashboardData]);

  //  Loading state
  if (isLoading) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  // Unauthorized while redirecting
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return <div className="p-6 text-center">Unauthorized</div>;
  }


    
    return (
        <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {dashboardData?.studentDetails.map((student) => (
                    <div
                        key={student.email}
                        className="bg-white rounded-lg shadow-md p-4 border"
                    >
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-600">
                                    Name:
                                </span>
                                <span className="text-sm font-medium">
                                    {student.name}
                                </span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-600">
                                    Email:
                                </span>
                                <span className="text-sm break-all">
                                    {student.email}
                                </span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-600">
                                    Phone:
                                </span>
                                <span className="text-sm">{student.phone}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <span className="font-semibold text-sm text-gray-600">
                                    Course:
                                </span>
                                <span className="text-sm">
                                    {/* {student.enrolledCourses} */}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:flex justify-center">
                <div className="w-full max-w-6xl overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0 rounded-lg overflow-hidden shadow-lg min-w-max">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-4 py-3 text-md font-medium border border-gray-500 rounded-tl-lg whitespace-nowrap">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-md font-medium border-t border-r border-b border-gray-500 whitespace-nowrap">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-md font-medium border-t border-r border-b border-gray-500 whitespace-nowrap">
                                    Phone
                                </th>
                                {/* <th className="px-4 py-3 text-md font-medium border-t border-r border-b border-gray-500 rounded-tr-lg whitespace-nowrap">
                                    Course
                                </th> */}
                            </tr>
                        </thead>
                        <tbody className="text-center bg-white">
                            {dashboardData?.studentDetails.map(
                                (student, index) => (
                                    <tr key={student.email}>
                                        <td
                                            className={`border-l border-r border-b border-gray-300 px-4 py-3 text-md whitespace-nowrap ${index ===
                                                dashboardData.studentDetails
                                                    .length -
                                                1
                                                ? 'rounded-bl-lg'
                                                : ''
                                                }`}
                                        >
                                            {student.name}
                                        </td>
                                        <td className="border-r border-b border-gray-300 px-4 py-3 text-md">
                                            {student.email}
                                        </td>
                                        <td className="border-r border-b border-gray-300 px-4 py-3 text-md whitespace-nowrap">
                                            {student.phone}
                                        </td>
                                        {/* <td className={`border-r border-b border-gray-300 px-4 py-3 text-md ${index ===
                                            dashboardData.studentDetails
                                                .length -
                                            1
                                            ? 'rounded-br-lg'
                                            : ''
                                            }`}
                                        >
                                            {student.enrolledCourses}
                                        </td> */}
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllStudents;
