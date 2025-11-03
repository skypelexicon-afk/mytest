'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    getCourseDetailsUnAuth,
    getEnrolledCourseIds,
} from '@/lib/api/Courses';
import {
    CourseDetails,
    Course as CourseType,
    FAQ,
} from '@/lib/types/courseType';
import { formatDateWithSuffix } from '@/lib/utils/dateFormatter';
import CourseCard from '@/components/Courses/CourseCard';
import EnrolledCourseCard from '@/components/Courses/EnrolledCourseCard';
import { useAuthStore } from '@/store/useAuthStore';
import ShareDropdown from '@/components/ShareDropdown';
import { FaBell, FaCalendarAlt, FaBook, FaPencilAlt } from 'react-icons/fa';
import { TiTick } from 'react-icons/ti';
import { MdOndemandVideo } from 'react-icons/md';
import { removeInlineStyles } from '@/lib/utils/cleanHtml';
import { fetchApi } from '@/lib/doFetch';

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    course_id: string;
    user_name: string;
}

const ExploreCoursePage = () => {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const { id } = useParams();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    const isAuthenticated = !!user;
    const courseId = Number(id);
    const isEnrolled = isAuthenticated && enrolledIds.includes(courseId);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetchApi.get<{ reviews: Review[] }>(
                    `api/reviews/${id}`,
                );
                setReviews(res.reviews);
            } catch (err) {
                console.log('Error fetching reviews: ', err);
            }
        };
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const allCoursesResult = await getCourseDetailsUnAuth(courseId);

                setFaqs(allCoursesResult.faqs || []);
                setCourse(allCoursesResult);
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Failed to load course data.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
            fetchReviews();
        }
    }, [id]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const ids = await getEnrolledCourseIds();
                setEnrolledIds(ids);
            } catch (err) {
                console.error('Error fetching enrollments:', err);
            }
        };

        if (isAuthenticated) {
            fetchEnrollments();
        }
    }, [isAuthenticated]);

    if (loading) return <div className="ml-64 p-10">Loading course...</div>;
    if (error) return <div className="ml-64 p-10 text-red-600">{error}</div>;
    if (!course) return null;

    const renderCourseCard = () => {
        // Ensure discountLabel is a number for the props
        const courseCardProps = {
            ...course,
            // discountLabel: typeof course.discountLabel === 'string' ? Number(course.discountLabel) : course.discountLabel,
        };

        if (!isAuthenticated) {
            return <CourseCard {...courseCardProps} />;
        } else {
            return isEnrolled ? (
                <EnrolledCourseCard {...courseCardProps} />
            ) : (
                <CourseCard {...courseCardProps} />
            );
        }
    };

    const handleAllClassesClick = () => {
        if (isEnrolled) {
            router.push(`/student/dashboard/course/${id}`);
        } else {
            router.push(`/all-courses/course/${id}`);
        }
    };

    return (
        <div
  className="w-full overflow-hidden relative  pb-28 -mt-[100px]"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>
        <div //className="min-h-screen p-4 bg-gray-50 max-w-4xl mx-auto justify-center mt-25"
        className="min-h-screen p-4 bg-yellow-800 max-w-4xl mx-auto justify-center mt-25"
        >
            <div //className="rounded-2xl shadow-md bg-white mb-4"
            className="rounded-2xl shadow-md bg-yellow-200 mb-4"
            >
                <div //className="bg-violet-600 text-white px-6 pt-9 pb-9"
                className=" text-yellow-200 px-6 pt-9 pb-9"
                style={{ backgroundColor: '#4A1B09' }}
                >
                    <h2 className="text-xl md:text-2xl font-bold">
                        {course.title}
                    </h2>
                </div>

                <div //className="bg-white w-full flex flex-col md:flex-row justify-between md:items-end px-6 py-1 rounded-b-2xl shadow-md items-center"
                className="bg-yellow-200 w-full flex flex-col md:flex-row justify-between md:items-end px-6 py-1 rounded-b-2xl shadow-md items-center"
                >
                    <div className="flex gap-6 text-sm justify-center font-medium text-black">
                        <span
                            onClick={() =>
                                setIsDescriptionVisible((prev) => !prev)
                            }
                            //className={`cursor-pointer text-lg ${isDescriptionVisible ? 'text-violet-600' : 'hover:text-violet-600'}`}
                            className={`cursor-pointer text-lg ${isDescriptionVisible ? 'text-yellow-800' : 'hover:text-yellow-800'}`}
                        >
                            Details
                        </span>
                        <span
                            onClick={handleAllClassesClick}
                            //className="cursor-pointer text-lg hover:text-violet-600"
                            className="cursor-pointer text-lg hover:text-yellow-800"
                        >
                            Lectures
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2 md:mt-0">
                        <div className="">
                            <ShareDropdown
                                title={course.title}
                                price={course.price}
                                id={course.id}
                                type="course"
                            />
                        </div>
                    </div>
                </div>
                {isDescriptionVisible && (
                    <div
                        className="my-4 mx-4 py-4 text-gray-700 prose prose-sm md:prose-base max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: removeInlineStyles(course.description),
                        }}
                    />
                )}
            </div>

            <div className="mt-8 flex flex-col md:flex-row justify-between">
                <div //className="bg-white shadow-2xl rounded-b-2xl py-8 px-10 text-sm text-black justify-between"
                className="bg-yellow-200 shadow-2xl rounded-b-2xl py-8 px-10 text-sm text-yellow-800 justify-between"
                >
                    <h3 className="text-lg font-bold mb-4">
                        What you will get:
                    </h3>
                    {course.contents && course.contents.length !== 0 && (
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div //className="bg-gray-300 w-6 h-6 rounded-full flex items-center justify-center"
                                className="bg-yellow-800 w-6 h-6  rounded-full flex items-center justify-center"
                                >
                                    <FaCalendarAlt //className="text-xs text-black"
                                    className="text-xs text-yellow-200"
                                     />
                                </div>
                                <span>
                                    Course validity:
                                    <span className="font-semibold flex flex-row gap-1">
                                        <div>
                                            {formatDateWithSuffix(
                                                course.startDate,
                                            )}{' '}
                                            -{' '}
                                            {formatDateWithSuffix(
                                                course.endDate,
                                            )}
                                        </div>
                                    </span>
                                </span>
                            </li>
                            {course.contents.map((data, idx) => (
                                <li
                                    className="flex items-center gap-3"
                                    key={idx}
                                >
                                    <div //className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
                                    className="w-6 h-6 bg-yellow-800 text-yellow-200 rounded-full flex items-center justify-center"
                                    >
                                        <TiTick />
                                    </div>
                                    <span>{data}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!course.contents ||
                        (course.contents.length === 0 && (
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div //className="bg-gray-300 w-6 h-6 rounded-full flex items-center justify-center"
                                    className="bg-yellow-800 w-6 h-6 rounded-full flex items-center justify-center"
                                    >
                                        <FaCalendarAlt //className="text-xs text-black"
                                        className="text-xs text-yellow-200"
                                         />
                                    </div>
                                    <span>
                                        Course validity:
                                        <span className="font-semibold flex flex-row gap-1">
                                            <div>
                                                {formatDateWithSuffix(
                                                    course.startDate,
                                                )}{' '}
                                                -{' '}
                                                {formatDateWithSuffix(
                                                    course.endDate,
                                                )}
                                            </div>
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div //className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
                                    className="w-6 h-6 bg-yellow-800 text-yellow-200 rounded-full flex items-center justify-center"
                                    >
                                        <MdOndemandVideo />
                                    </div>
                                    <span>Recorded Lectures</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div //className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
                                    className="w-6 h-6 bg-yellow-800  rounded-full flex items-center justify-center"
                                    >
                                        <FaBook />
                                    </div>
                                    <span>Lecture notes</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div //className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center"
                                    className="w-6 h-6 bg-yellow-800 rounded-full flex items-center justify-center"
                                    >
                                        <FaPencilAlt />
                                    </div>
                                    <span>
                                        5 Year <b>MAKAUT</b> PYQs & 100+
                                        Practice questions
                                    </span>
                                </li>
                            </ul>
                        ))}
                    <h3 className="text-lg font-bold mt-10">
                        Know your educator:
                    </h3>
                    <div //className="flex flex-col items-center bg-white p-4 rounded-2xl w-fit"
                    className="flex flex-col items-center bg-yellow-800 p-4 rounded-2xl w-fit"
                    >
                        <img
                            src={course.educatorImage}
                            alt={course.educatorName}
                            //className="w-52 h-52 object-cover rounded-full border border-gray-300 shadow-sm"
                            className="w-52 h-52 object-cover rounded-full border border-yellow-800 shadow-sm"
                        />
                        <p //className="mt-3 text-lg font-semibold text-gray-800 text-center"
                        className="mt-3 text-lg font-semibold text-yellow-200 text-center"
                        >
                            {course.educatorName}
                        </p>
                    </div>
                </div>

                <div //className="p-4 bg-gray-50 max-w-4xl mx-auto"
                className="p-4 bg-yellow-200 max-w-4xl mx-auto"
                >
                    {renderCourseCard()}
                </div>
            </div>
            <div className="mx-auto py-10 text-yellow-200 px-4">
                <h2 className="text-2xl font-semibold mb-4">Demo videos</h2>
                {course.demoVideos && course.demoVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.demoVideos.map((url, index) => (
                            <div key={index} className="aspect-video">
                                <iframe
                                    src={url.replace('watch?v=', 'embed/')}
                                    title={`Demo Video ${index + 1}`}
                                    allowFullScreen
                                    className="w-full h-full rounded-lg border"
                                ></iframe>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p //className="text-gray-500"
                    className="text-yellow-800"
                    >No demo videos available.</p>
                )}
            </div>

            {/* Reviews */}
            <div className="max-w-3xl text-yellow-200 mx-auto py-10 px-4">
                <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                {reviews.length === 0 ? (
                    <p>No reviews available for this course yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map((rev, idx) => (
                            <li key={idx} className="border p-4 rounded shadow">
                                <p>Rating: {rev.rating} ⭐</p>
                                <p className="font-bold text-xl py-2">
                                    {rev.comment}
                                </p>
                                <p>
                                    By: {rev.user_name} •{' '}
                                    {new Date(
                                        rev.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* FAQs */}
            <div className="max-w-3xl mx-auto text-yellow-200 py-10 px-4">
                <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
                {faqs.length === 0 ? (
                    <p>No FAQs available for this course yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <li key={idx} className="border p-4 rounded shadow">
                                <p className="font-bold">Q: {faq.question}</p>
                                <p>A: {faq.answer}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        </div>
    );
};

export default ExploreCoursePage;
