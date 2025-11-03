'use client';
import React, { useEffect, useState } from 'react';
import EnrolledCourseCard from '@/components/Courses/EnrolledCourseCard';
import { Course } from '@/lib/types/courseType';
import { getEnrolledCourseIds, getCourseById } from '@/lib/api/Courses';
import StreakHistory from '@/components/StreakHistory';

export default function EnrolledCoursePage() {
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const courseIds = await getEnrolledCourseIds();

                const courses = await Promise.all(
                    courseIds.map(async (id) => {
                        try {
                            const course = await getCourseById(id);
                            return course;
                        } catch (err) {
                            console.error(
                                `Failed to fetch course with id ${id}`,
                                err,
                            );
                            return null;
                        }
                    }),
                );

                setEnrolledCourses(
                    courses.filter(
                        (course): course is Course => course !== null,
                    ),
                );
            } catch (err) {
                console.error('Error fetching enrolled courses:', err);
                setErr('Failed to load enrolled courses.');
            }
        };

        fetchEnrolledCourses();
    }, []);

    return (

       
    

        <div className="container mx-auto px-4 py-8">
            {/* Streak Calendar Section */}
            <div className="mb-8">
                <StreakHistory />
            </div>

            {/* Enrolled Courses Section */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📚 My Enrolled Courses
            </h2>
            {err && <p className="text-red-500">{err}</p>}
            {enrolledCourses.length === 0 ? (
                <p className="text-gray-500">
                    You are not enrolled in any courses.
                </p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">


                    {enrolledCourses.map((course) => (
                        <EnrolledCourseCard key={course.id} {...course} />
                    ))}
                </div>
            )}
        </div>
        
    );
}
