'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCourseDetails } from '@/lib/api/Courses';
import { CourseDetails } from '@/lib/types/courseType';
import Video from '@/components/Video';

export default function VideoPage() {
    const { id, subSectionId } = useParams();
    const router = useRouter();
    const courseId = Number(id);
    const targetSubSectionId = subSectionId ? Number(subSectionId) : undefined;

    const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const data = await getCourseDetails(courseId);
                setCourseDetails(data);
            } catch (error) {
                console.error('Failed to fetch course details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const handleClose = () => {
        // Navigate back to course details or dashboard
        router.push(`/student/dashboard/course/${courseId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading course video...</p>
                </div>
            </div>
        );
    }

    return (
        <Video
            courseDetails={courseDetails}
            initialSubSectionId={targetSubSectionId}
            onClose={handleClose}
        />
    );
}
