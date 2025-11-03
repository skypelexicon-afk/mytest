import React from 'react';
import { AdminDashboardSidebar } from '@/components/Navbar/SideBar/AdminDashSB';
import AdminDashTopbar from '@/components/Navbar/TopBar/AdminDashTB';

type Props = {
    children: React.ReactNode;
};

export default function AdminDashboardNav({ children }: Props) {
    return (
        <div className="flex h-screen">
            <div className="hidden md:block w-[20%] bg-gray-100">
                <AdminDashboardSidebar />
            </div>
            <div className="flex flex-col w-full md:w-[80%] overflow-y-auto">
                <AdminDashTopbar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
