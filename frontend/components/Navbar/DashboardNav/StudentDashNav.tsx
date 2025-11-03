import React from 'react';
import { StudentDashboardSidebar } from '@/components/Navbar/SideBar/StudentDashSB';
import StudentDashTopbar from '@/components/Navbar/TopBar/StuDashTB';

type Props = {
    children: React.ReactNode;
};

export default function StudentDashboardNav({ children }: Props) {
    return (
        <div className="flex h-screen">
            <div className="hidden md:block w-[20%] bg-gray-100">
                <StudentDashboardSidebar />
            </div>
            <div className="flex flex-col w-full md:w-[80%] overflow-y-auto">
                <StudentDashTopbar />
                <main className="flex-1 p-4 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
