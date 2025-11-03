import React from 'react';
import { EducatorDashboardSidebar } from '@/components/Navbar/SideBar/EducatorDashSB';
import EducatorDashTopbar from '@/components/Navbar/TopBar/EduDashTB';

type Props = {
    children: React.ReactNode;
};

export default function EducatorDashboardNav({ children }: Props) {
    return (
        <div className="flex h-screen">
            <div className="hidden md:block w-[20%] bg-gray-100">
                <EducatorDashboardSidebar />
            </div>
            <div className="flex flex-col w-full md:w-[80%] overflow-y-auto">
                <EducatorDashTopbar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
