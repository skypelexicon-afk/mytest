'use client';
import React, { useState, useEffect, use } from 'react';
import PurchasedCourseCard from '@/components/Courses/PurchasedCourCard';
import { getPurchasedCourses, PurchasedCourse } from '@/lib/api/Courses';

export default function MyPurchases() {
    const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>(
        [],
    );
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const orders = await getPurchasedCourses();
                setPurchasedCourses(orders);
            } catch (err) {
                console.error('Error fetching purchased courses:', err);
                setPurchasedCourses([]);
            }
        };

        fetchCourses();
    }, []);

    return (
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full max-w-6xl mx-auto p-4">
            {purchasedCourses.map((course: PurchasedCourse) => {
                const isCourse = course.course_id && course.course_title && course.course_image;
                const isBundle = course.bundle_id && course.bundle_title && course.bundle_image;

                if (!isCourse && !isBundle) return null;

                return (
                    <PurchasedCourseCard
                        key={course.order_id}
                        id={isCourse ? course.course_id! : course.bundle_id!}
                        title={isCourse ? course.course_title! : course.bundle_title!}
                        image={isCourse ? course.course_image! : course.bundle_image!}
                        createdAt={course.created_at}
                        type={isCourse ? "course" : "bundle"}
                    />
                );
            })}
        </div>
    );
}
