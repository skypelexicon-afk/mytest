'use client';
import React, { useState, useEffect } from 'react';
// import { getAllOrders } from '@/lib/api/Orders';
// import { DashboardData } from '@/lib/types/adminDataType';
// import { fetchData } from '@/lib/api/adminData';
import { useAuthStore } from '@/store/useAuthStore';
import { LuUsers } from 'react-icons/lu';
import { FaBook, FaGraduationCap, FaMoneyBill, FaFire } from 'react-icons/fa6';
import { PiCurrencyInrBold } from 'react-icons/pi';
// import { useCourseStore } from '@/store/useCourseStore';
import { useDashboardStore } from '@/store/useAdminDataStore';
import { useRouter } from 'next/navigation';
export default function AdminDashboard() {
    // const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    //     null,
    // );
    const router = useRouter();
    const { enrollmentData, dashboardData, error, fetchDashboardData } =
        useDashboardStore();
    // const [error, setError] = useState<string | null>(null);
    const [ordersCount, setOrdersCount] = useState<number>(0);
    const [bestSellingCourse, setBestSellingCourse] = useState<string>('');
    const [totalIncome, setTotalIncome] = useState<number>(0); //intiated with 0 to make it wrk
    // const { courses, fetchCourses } = useCourseStore();
    const { user, isAuthenticated, isLoading, hasHydrated } = useAuthStore();

    // Protect route
    useEffect(() => {
        if (!hasHydrated || isLoading) return; // wait until hydration is complete

        if (!isAuthenticated) {
            router.push('/');
        } else if (user?.role !== 'super_admin') {
            router.push('/unauthorized');
        }
    }, [hasHydrated, isLoading, isAuthenticated, user, router]);

    // Fetch admin data
    useEffect(() => {
        if (isAuthenticated && user?.role === 'super_admin') {
            if (!enrollmentData && !dashboardData) {
                fetchDashboardData();
            }
        }
    }, [
        isAuthenticated,
        user,
        enrollmentData,
        dashboardData,
        fetchDashboardData,
    ]);

    // useEffect(() => {
    //     const fetchOrdersCount = async () => {
    //         try {
    //             const orders = await getAllOrders();
    //             setOrdersCount(orders.total);
    //         } catch (err) {
    //             console.error('Error fetching orders count:', err);
    //         }
    //     };

    //     fetchOrdersCount();
    // }, []);
    // useEffect(() => {
    //     fetchCourses();
    // }, [fetchCourses]);

    useEffect(() => {
        console.log('Enrollment data: ', enrollmentData);
        console.log('Dashboard data: ', dashboardData);
        let max: number = 0;
        let best: string = '';
        enrollmentData?.enrollments.forEach((course) => {
            if (
                max < course.bundle_count + course.direct_count &&
                course.total_amount !== 0
            ) {
                max = course.bundle_count + course.direct_count;
                best = course.course_title;
            }
        });
        let total: number = 0;
        if (dashboardData) {
            total = dashboardData.totalAmount;
        }
        console.log(total);
        setTotalIncome(total);
        setBestSellingCourse(best);
    }, [enrollmentData, dashboardData]);

    // Handle loading state
    if (!hasHydrated || isLoading) {
        return <p className="p-4">Loading...</p>;
    }

    // Block rendering until authorized
    if (!isAuthenticated || user?.role !== 'super_admin') {
        return null;
    }

    return (
        <>
            <div className="bg-gray-100 p-4 min-h-screen">
                <h1 className="text-2xl font-bold mb-4">
                    Welcome to Admin Dashboard
                </h1>
                <div className="flex flex-col md:flex-row gap-4 mb-4 ">
                    <div className="flex-1 flex flex-col bg-white shadow-lg rounded-lg p-4 ">
                        <LuUsers
                            size={30}
                            className="inline bg-blue-300 rounded-full p-1"
                        />
                        <span>Total Students</span>
                        <p className="font-bold">
                            {dashboardData?.studentCount || 0}
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col bg-white shadow-lg rounded-lg p-4 ">
                        <FaGraduationCap
                            size={30}
                            className="inline bg-green-300 rounded-full p-1"
                        />
                        <span>Total Educators</span>
                        <p className="font-bold">
                            {dashboardData?.educatorCount || 0}
                        </p>
                    </div>
                    <div className="flex-1 flex flex-col bg-white shadow-lg rounded-lg p-4">
                        <PiCurrencyInrBold
                            size={30}
                            className="inline bg-pink-300 rounded-full p-1"
                        />
                        <span>Total Income</span>
                        <p className="font-bold">₹{totalIncome}</p>
                    </div>
                    <div className="flex-1 flex flex-col bg-white shadow-lg rounded-lg p-4">
                        <FaBook
                            size={30}
                            className="inline bg-yellow-200 rounded-full p-1"
                        />
                        <span>Total Courses</span>
                        <p className="font-bold">
                            {enrollmentData?.enrollments.length || 0}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-4 max-w-lg">
                    <FaFire
                        size={30}
                        className="inline bg-orange-300 rounded-full p-1 mr-2"
                    />
                    <p>Best selling course</p>
                    <p className="ml-2 text-xl font-bold">
                        {bestSellingCourse.trim() !== '' && bestSellingCourse}
                        {bestSellingCourse === '' && 'No data available'}
                    </p>
                </div>
            </div>
        </>
    );
}
