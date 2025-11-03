'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getEnrolledCourseIds } from '@/lib/api/Courses';
import { CourseDetails } from '@/lib/types/courseType';
import { getCourseDetails, getCourseDetailsUnAuth } from '@/lib/api/Courses';
import { getCourseProgress } from '@/lib/api/Progress';
import { FaVideo, FaCheckCircle as FaCheckCircleSolid, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaFileAlt, FaBell, FaFileCode } from 'react-icons/fa';
import Video from '@/components/Video';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';
import { Review } from '@/lib/types/review';
import { fetchApi } from '@/lib/doFetch';
import { FaTelegramPlane } from 'react-icons/fa';

type FetchError = {
    message?: string;
};

export default function StudentFaqList() {
    const { id } = useParams();
    const courseId = Number(id);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
        null,
    );
    const [selectedSubSectionId, setSelectedSubSectionId] = useState<
        number | null
    >(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [completedSubsections, setCompletedSubsections] = useState<number[]>([]);
    const [courseProgress, setCourseProgress] = useState<{
        percentage: number;
        completedCount: number;
        totalSubsections: number;
    } | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set()); // Track expanded sections by ID
    const telegramLinks: Record<number, string> = {
        1: 'https://t.me/+RT3Gv22J-BA1ZjRl', //eng phy
        2: 'https://t.me/+hUhKqcFdEw5kYzY1', //bee bee bee bee

        7: 'https://t.me/+6OUyin8po7llZDll', //dsa in c
        8: 'https://t.me/+6OUyin8po7llZDll', //dsa infinity
        9: 'https://t.me/+VNaaDLCU1Lk5NDA1', //eco for engineering

        11: 'https://t.me/+-CcTxKehQcI4ZDc1', //co
        12: 'https://t.me/+NE9IPKHRBPUyYTc1', //oops
        13: 'https://t.me/+BMBv1KweYeJjYjRl', //python programming
        14: 'https://t.me/+BMBv1KweYeJjYjRl', //python infinity

        16: 'https://t.me/+HonaufXwwWo5YjFl', //java infinity
        17: 'https://t.me/+hUhKqcFdEw5kYzY1', //analog and digital new one
    };

    const telegramLink = telegramLinks[courseId];

    const handleDiscussionClick = () => {
        if (telegramLink) {
            window.open(telegramLink, '_blank');
        } else {
            alert('No discussion group available for this course.');
        }
    };

    const toggleSection = (sectionId: number) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (!courseId) {
            setError('Invalid course ID');
            setIsAuthorized(false);
            return;
        }

        const fetchCourseDetails = async () => {
            try {
                if (user) {
                    const data = await getCourseDetails(courseId);
                    console.log(data);

                    setCourseDetails(data);
                    setIsAuthorized(true);
                } else {
                    const data = await getCourseDetailsUnAuth(courseId);
                    console.log(data);
                    setCourseDetails(data);
                    setIsAuthorized(false);
                }
            } catch (err) {
                const typedErr = err as FetchError;
                setError(typedErr.message || 'Failed to load course details');
                setIsAuthorized(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if (!courseId || !user) return;

        const verifyEnrollmentAndFetchFaqs = async () => {
            try {
                const enrolledCourseIds = await getEnrolledCourseIds();
                if (!enrolledCourseIds.includes(courseId)) {
                    setIsAuthorized(false);
                    setError('You are not enrolled in this course.');
                    return;
                }

                setIsAuthorized(true);
            } catch (err) {
                const typedErr = err as FetchError;
                setError(typedErr.message || 'Failed to load FAQs');
                setIsAuthorized(false);
            }
        };

        verifyEnrollmentAndFetchFaqs();
    }, [courseId, user]);

    const fetchMyReviews = async () => {
        try {
            if (user) {
                const data = await fetchApi.get<{ reviews: Review[] }>(
                    `api/reviews/user`,
                );
                setReviews(data.reviews || []);
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setReviews([]);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchMyReviews();
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId && user) {
            fetchProgress();
        }
    }, [courseId, user]);

    const fetchProgress = async () => {
        try {
            const progress = await getCourseProgress(courseId);
            setCompletedSubsections(progress.completedSubsections || []);
            setCourseProgress({
                percentage: progress.percentage,
                completedCount: progress.completedCount,
                totalSubsections: progress.totalSubsections,
            });
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    return (
        <>
        
            <div>
                <div className="max-w-3xl mx-auto py-10 px-4 ">
                    <h1 className="font-bold text-yellow-800 text-2xl md:text-4xl text-center mb-2">
                        {courseDetails?.title}
                    </h1>
                </div>

                <div className="max-w-3xl mx-auto px-4 flex justify-end">
                    <button
                        className="flex items-center gap-2 mr-4 border border-yellow-800 text-yellow-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-800 hover:text-yellow-200 cursor-pointer"
                        onClick={handleDiscussionClick}
                    >
                        <FaTelegramPlane /> Discussion
                    </button>
                    <button
                        //className="flex items-center gap-2 border border-black text-black px-4 py-1.5 rounded-md text-sm font-medium hover:bg-purple-50 cursor-pointer"
                        className="flex items-center gap-2 border border-yellow-800 text-yellow-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-800 hover:text-yellow-200 cursor-pointer"
                        onClick={() =>
                            router.push(
                                `/student/dashboard/course/${courseId}/announcements`,
                            )
                        }
                    >
                        <FaBell /> Announcements
                    </button>
                </div>

                <div className="max-w-3xl text-yellow-800 mx-auto p-4">
                    <span>
                        <p className="font-bold  text-lg">Course Structure</p>
                        <p>
                            {courseDetails?.sections?.length} Sections -
                            {courseDetails?.sections?.reduce(
                                (total, section) =>
                                    total + section.subSections.length,
                                0,
                            )}{' '}
                            Subsections
                        </p>
                        {courseDetails?.totalFreeVideos && courseDetails.totalFreeVideos > 0 && (
                            <p className="text-green-600 font-semibold mt-2">
                                🎉 {courseDetails.totalFreeVideos} Free {courseDetails.totalFreeVideos === 1 ? 'Video' : 'Videos'} Available!
                            </p>
                        )}
                        {isAuthorized && courseProgress && (
                            <div //className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-4"
                            className="mt-3 bg-yellow-800 border border-purple-200 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span //className="text-sm font-semibold text-gray-700"
                                    className="text-sm font-semibold text-yellow-200"
                                    >
                                        Course Progress
                                    </span>
                                    <span //className="text-lg font-bold text-purple-600"
                                    className="text-lg font-bold text-yellow-200"
                                    >
                                        {courseProgress.percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                    <div
                                       // className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                                        className="bg-gradient-to-r from-yellow-200 to-yellow-200 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${courseProgress.percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-yellow-200">
                                    {courseProgress.completedCount} of {courseProgress.totalSubsections} lessons completed
                                </p>
                            </div>
                        )}
                    </span>
                    {courseDetails?.sections?.length ? (
                        <div className="my-4">
                            {courseDetails.sections
                                .map((section, sectionIndex) => {
                                    const isExpanded = expandedSections.has(section.id);
                                    const freeSectionVideos = section.subSections.filter(sub => sub.is_free).length;
                                    
                                    return (
                                        <div key={section.id} className="mt-4 border border-gray-300 rounded-md">
                                            <div 
                                                //className="bg-gray-200 px-4 py-2 shadow-md flex items-center justify-between rounded-t-md border-b border-gray-300 cursor-pointer hover:bg-gray-300 transition-colors"
                                                className="bg-yellow-200 px-4 py-2 shadow-md text-yellow-800 flex items-center justify-between rounded-t-md border-b border-yellow-300 cursor-pointer hover:bg-yellow-800 hover:text-yellow-200 transition-colors"
                                                onClick={() => toggleSection(section.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">
                                                        {sectionIndex + 1}. {section.name}
                                                    </h3>
                                                    {freeSectionVideos > 0 && (
                                                        <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                                            {freeSectionVideos} Free
                                                        </span>
                                                    )}
                                                </div>
                                                {isExpanded ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                                            </div>

                                            {isExpanded && (
                                                <ul //className="bg-purple-200 max-h-96 opacity-100 overflow-y-auto"
                                                className="bg-yellow-200 text-yellow-800 max-h-96 opacity-100 overflow-y-auto"
                                                >
                                                    {section.subSections
                                                        .map((subSection, subIndex) => (
                                                            <li
                                                                key={
                                                                    subSection.subSectionId
                                                                }
                                                                //className="py-2 px-4 border-b border-gray-300 hover:bg-purple-300 transition-colors duration-200 justify-between flex items-center md:text-md text-sm"
                                                            className="py-2 px-4 border-b border-yellow-200 hover:bg-yellow-800 hover:text-yellow-200 transition-colors duration-200 justify-between flex items-center md:text-md text-sm"
                                                            >
                                                                <div className="flex-1 flex items-center gap-2">
                                                                    {completedSubsections.includes(subSection.subSectionId) && (
                                                                        <FaCheckCircleSolid className="text-green-600 flex-shrink-0" size={16} />
                                                                    )}
                                                                    <p className="line-clamp-2">
                                                                        {sectionIndex +
                                                                            1}
                                                                        .{subIndex + 1}{' '}
                                                                        {
                                                                            subSection.name
                                                                        }
                                                                    </p>
                                                                    {subSection.is_free && (
                                                                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                                                            FREE
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {subSection.type ===
                                                                    'video' && (
                                                                    <span className="flex ml-4 items-center mr-2 gap-1">
                                                                        <span className="text-gray-500">
                                                                            Duration:
                                                                        </span>
                                                                        <span className="font-semibold">
                                                                            {
                                                                                subSection.duration
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                {isAuthorized &&
                                                                    subSection.file_url && (
                                                                        <span className="flex items-center gap-2">
                                                                            <div className="hidden md:flex flex-col text-md">
                                                                                {subSection.type ===
                                                                                'video' ? (
                                                                                    <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                                                                                        <span className="flex items-center gap-1">
                                                                                            <span className="text-gray-500">
                                                                                                Watch
                                                                                                Lecture
                                                                                            </span>
                                                                                        </span>
                                                                                    </div>
                                                                                ) : subSection.type ===
                                                                                  'attachment' ? (
                                                                                    <span //className="text-indigo-500 hover:underline"
                                                                                    className="text-gray-500 hover:underline"
                                                                                    >
                                                                                        View
                                                                                        file
                                                                                    </span>
                                                                                ) : (
                                                                                    <span //className="text-indigo-500 hover:underline"
                                                                                    className="text-gray-500 hover:underline"
                                                                                    >
                                                                                        View
                                                                                        code
                                                                                        file
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                <span
                                                                                    className="cursor-pointer"
                                                                                    title={
                                                                                        subSection.type ===
                                                                                        'video'
                                                                                            ? 'Open video'
                                                                                            : subSection.type ===
                                                                                                'attachment'
                                                                                              ? 'Open file'
                                                                                              : 'Open code file'
                                                                                    }
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedSubSectionId(
                                                                                            subSection.subSectionId,
                                                                                        );
                                                                                        setShowVideoPlayer(
                                                                                            true,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {subSection.type ===
                                                                                    'video' ? (
                                                                                        <FaVideo
                                                                                            size={
                                                                                                25
                                                                                            }
                                                                                            className="text-blue-600 hover:text-blue-800"
                                                                                        />
                                                                                    ) : subSection.type ===
                                                                                      'attachment' ? (
                                                                                        <FaFileAlt
                                                                                            size={
                                                                                                25
                                                                                            }
                                                                                            className="text-gray-600 hover:text-gray-800"
                                                                                        />
                                                                                    ) : (
                                                                                        <FaFileCode
                                                                                            size={
                                                                                                25
                                                                                            }
                                                                                            className="text-gray-600 hover:text-gray-800"
                                                                                        />
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </span>
                                                                    )}
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <p className="text-gray-500">No sections available.</p>
                    )}
                </div>

                {/*Student Reviews Section. */}
                <div className="max-w-3xl mx-auto p-4 text-yellow-800 space-y-6">
                    <h2 className="text-xl font-bold text-yellow-800">Submit your Review</h2>

                    {isAuthorized ? (
                        <>
                            <ReviewForm
                            
                                courseId={courseId}
                                onSuccess={fetchMyReviews}
                            />
                            <ReviewList
                                reviews={reviews}
                                refresh={fetchMyReviews}
                            />
                        </>
                    ) : (
                        <p //className="text-gray-500"
                        className="text-yellow-800"
                        >
                            Enroll in this course to add/view reviews.
                        </p>
                    )}
                </div>
            </div>

            {showVideoPlayer && (
                <Video
                    courseDetails={courseDetails}
                    initialSubSectionId={selectedSubSectionId || undefined}
                    onClose={() => {
                        setShowVideoPlayer(false);
                        setSelectedSubSectionId(null);
                    }}
                />
            )}
           
        </>
    );
}