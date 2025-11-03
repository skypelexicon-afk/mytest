'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllOrders } from '@/lib/api/Orders';
import { Order } from '@/lib/types/orderType';
import { DashboardData } from '@/lib/types/adminDataType';
import { useCourseStore } from '@/store/useCourseStore';
import { useDashboardStore } from '@/store/useAdminDataStore';
import { useAuthStore } from '@/store/useAuthStore';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const AllTransactions: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const { dashboardData, fetchDashboardData } = useDashboardStore();
    const { courses, fetchCourses } = useCourseStore();

    const [orders, setOrders] = useState<Order[]>([]);
    const [students, setStudents] = useState<DashboardData['studentDetails']>(
        [],
    );
    const [error, setError] = useState<string | null>(null);

    // ✅ Auth protection
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    // ✅ Fetch data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const orderRes = await getAllOrders();
                setOrders(orderRes.orders);

                if (!dashboardData) {
                    await fetchDashboardData();
                }
                setStudents(dashboardData?.studentDetails || []);
                fetchCourses();
            } catch (err) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : 'Error loading dashboard data';
                setError(msg);
                console.error(msg);
            }
        };

        if (isAuthenticated && user?.role === 'super_admin') {
            fetchAllData();
        }
    }, [
        dashboardData,
        fetchDashboardData,
        fetchCourses,
        isAuthenticated,
        user,
    ]);

    const getStudentName = (id: number) =>
        students.find((s) => s.id === id)?.name || 'Unknown User';

    const getStudentEmail = (id: number) =>
        students.find((s) => s.id === id)?.email || 'Unknown Email';

    if (isLoading)
        return (
            <div className="p-6 text-center font-semibold">
                Checking authentication...
            </div>
        );

    if (!isAuthenticated || user?.role !== 'super_admin')
        return (
            <div className="p-6 text-center font-semibold">Unauthorized</div>
        );

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <h1 className="text-xl font-bold mb-4">All Transactions</h1>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* ✅ Mobile View - Cards */}
            <div className="space-y-4 md:hidden">
                {orders.map((order) => (
                    <Card
                        key={order.id}
                        className="p-4 shadow-sm border rounded-lg bg-white"
                    >
                        <p className="text-sm font-medium">
                            Transaction: {order.transaction_id}
                        </p>
                        <p className="text-xs text-gray-600">
                            {new Date(order.created_at).toLocaleString('en-IN')}
                        </p>

                        <p className="mt-2 text-sm font-medium">
                            {getStudentName(order.user_id)}
                        </p>
                        <p className="text-xs text-gray-500">
                            {getStudentEmail(order.user_id)}
                        </p>

                        <Badge
                            className="mt-3"
                            variant={
                                order.status === 'SUCCESS'
                                    ? 'default'
                                    : order.status === 'FAILED'
                                      ? 'destructive'
                                      : 'secondary'
                            }
                        >
                            {order.status}
                        </Badge>

                        <p className="mt-2 font-semibold text-sm">
                            ₹{order.order_amount / 100}
                        </p>
                    </Card>
                ))}
            </div>

            {/* ✅ Desktop View - Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
                <Table>
                    <TableCaption>
                        Total Transactions: {orders.length}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                className="hover:bg-muted/40"
                            >
                                <TableCell className="font-medium">
                                    {order.transaction_id}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell>
                                    {getStudentName(order.user_id)}
                                </TableCell>
                                <TableCell>
                                    {getStudentEmail(order.user_id)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            order.status === 'SUCCESS'
                                                ? 'default'
                                                : order.status === 'FAILED'
                                                  ? 'destructive'
                                                  : 'secondary'
                                        }
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    ₹{order.order_amount / 100}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AllTransactions;
