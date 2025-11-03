'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import FaqForm from '@/components/FAQ/FaqForm';

const EducatorCourseFaqPage = () => {
    const params = useParams();
    const id = params?.id;
    const courseId = Number(id);

    if (!id || isNaN(courseId)) {
        return (
            <div className="text-center py-10 text-red-600">
                Invalid course ID
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Create FAQ for Course #{courseId}
            </h1>
            <FaqForm courseId={courseId} />
        </div>
    );
};

export default EducatorCourseFaqPage;
