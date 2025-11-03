'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCreatedCourses } from '@/lib/api/Courses';
import { useCourseStore } from '@/store/useCourseStore';
import { Course } from '@/lib/types/courseType';

// type Course = {
//   id: number;
//   title: string;
//   image: string;
//   description: string;
//   educator_id: number;
//   created_at: string;
//   updated_at: string;
//   target: string;
//   originalPrice: number;
//   price: number;
//   discountLabel: string | number | undefined;
//   educatorName: string;
//   educatorImage: string;
//   demoVideos: string[];
//   startDate: string;
//   endDate: string;
//   is_active: boolean;
//   contents: string[];
//   faqs: FAQ[];
// };

const MyCoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const router = useRouter();

    const handleEditButtonClick = (course: Course) => {
        useCourseStore.getState().setCourse(course);
        router.push(`/educator/dashboard/edit-course/${course.id}`);
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await fetchCreatedCourses();
                setCourses(data.courses);
            } catch (err) {
                console.error('Failed to fetch educator courses:', err);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">My Courses</h1>

            {courses.length === 0 ? (
                <p>No courses found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-all"
                        >
                            {course.image ? (
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                />
                            ) : (
                                <div className="w-full h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-500 text-sm">
                                    No Image
                                </div>
                            )}

                            <h2 className="text-xl font-semibold">
                                {course.title}
                            </h2>
                            <p className="text-sm mb-1">
                                Price: ₹{course.price}{' '}
                                {course.discountLabel && (
                                    <span className="text-green-600 text-xs ml-2">
                                        {course.discountLabel}
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                {course.startDate?.slice(0, 10)} to{' '}
                                {course.endDate?.slice(0, 10)}
                            </p>

                            <div className='flex gap-2 items-center justify-center'>
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/educator/dashboard/course/${course.id}`,
                                        )
                                    }
                                    className="mt-2 w-full px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                                >
                                    Add Modules
                                </button>
                                <button
                                    onClick={() => handleEditButtonClick(course)}
                                    className="mt-2 w-full px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-600"
                                >
                                    Edit course
                                </button>
                            </div>
                            <div className='flex gap-2 items-center justify-center'>
                                <button
                                    onClick={() => router.push(
                                        `/educator/dashboard/course/${course.id}/announcement/`,
                                    )}
                                    className="mt-2 w-full px-4 py-2 text-sm rounded border-2 hover:bg-gray-200"
                                >
                                    Announcements
                                </button>
                                <button
                                    onClick={() => router.push(
                                        `/educator/dashboard/course/${course.id}/reviews/`,
                                    )}
                                    className="mt-2 w-full px-4 py-2 text-sm rounded border-2 hover:bg-gray-200"
                                >
                                    Reviews
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;
