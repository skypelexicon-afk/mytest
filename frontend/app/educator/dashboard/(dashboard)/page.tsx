'use client';
import React, { useEffect, useState } from 'react';
import { FaUserGraduate } from 'react-icons/fa6';
import { FaBook } from 'react-icons/fa';
import { formatDateWithSuffix } from '@/lib/utils/dateFormatter';
import { fetchStudentEnrollments } from '@/lib/api/Courses';
import { fetchCreatedCourses } from '@/lib/api/Courses';
import { Enrollment } from '@/lib/api/Courses';

const EducatorDashboard: React.FC = () => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [createdCoursesCountState, setCreatedCoursesCountState] =
        useState<number>(0);
    useEffect(() => {
        const fetchMyCoursesCount = async () => {
            try {
                const data = await fetchCreatedCourses();
                setCreatedCoursesCountState(data.total);
            } catch (error) {
                console.error('Error fetching created courses count:', error);
            }
        };
        fetchMyCoursesCount();
    }, []);

    useEffect(() => {
        const fetchEnroll = async () => {
            try {
                const data = await fetchStudentEnrollments();
                setEnrollments(data);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
            }
        };
        fetchEnroll();
    }, []);

    return (
        <div className="flex flex-col p-4 h-screen bg-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="flex flex-row items-center justify-center border-2 border-violet-600 w-full md:px-10 py-6 rounded-lg font-semibold gap-3">
                    <div className="flex flex-col justify-center">
                        <FaUserGraduate size={30} className="text-violet-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-base md:text-xl">
                            {enrollments.length}
                        </span>
                        <span className="text-base md:text-xl">
                            Total Enrollments
                        </span>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-center border-2 border-violet-600 w-full  md:px-10 py-6 rounded-lg font-semibold gap-3">
                    <div className="flex flex-col justify-center">
                        <FaBook size={30} className="text-violet-600" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-base md:text-xl">
                            {createdCoursesCountState}
                        </span>
                        <span className="text-base md:text-xl">
                            Total Courses
                        </span>
                    </div>
                </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-700 mb-4">
                Latest Enrollments
            </h1>
            <table className="w-full table-auto border-separate border-spacing-0 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-300">
                    <tr>
                        <th className="px-4 py-2 rounded-tl-lg md:text-lg">
                            Student Name
                        </th>
                        <th className="px-4 py-2 md:text-lg">Course Name</th>
                        <th className="px-4 py-2 rounded-tr-lg md:text-lg">
                            Enrollment Date
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {enrollments.map((enrollment, index) => (
                        <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-50 text-center"
                        >
                            <td className="px-4 py-2">
                                {enrollment.student_name}
                            </td>
                            <td className="px-4 py-2">
                                {enrollment.course_title}
                            </td>
                            <td className="px-4 py-2">
                                {formatDateWithSuffix(
                                    enrollment.enrollment_date,
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EducatorDashboard;
