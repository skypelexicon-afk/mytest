'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/doFetch';
import { useAuthStore } from '@/store/useAuthStore';
import {
    getCourseDetailsUnAuth,
    getEnrolledCourseIds,
} from '@/lib/api/Courses';
import { CourseDetails } from '@/lib/types/courseType';
import { FaChevronRight } from 'react-icons/fa';
import { FaVideo } from 'react-icons/fa6';
import { FaChevronLeft, FaLock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { log } from 'console';

type FAQ = {
    id: number;
    question: string;
    answer: string;
};

type FetchError = {
    message?: string;
};

export default function PublicCoursePage() {
    const router = useRouter();
    const { id } = useParams();
    const courseId = Number(id);
    const user = useAuthStore((state) => state.user);

    const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
        null,
    );
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(
        null,
    );
    const [error, setError] = useState('');
    const [openSections, setOpenSections] = useState<{
        [key: number]: boolean;
    }>({});
    const [hasPurchased, setHasPurchased] = useState(false);

    const toggleSection = (sectionId: number) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    useEffect(() => {
        if (!courseId) return;

        const fetchData = async () => {
            try {
                const details = await getCourseDetailsUnAuth(courseId);
                console.log(details);
                setCourseDetails(details);

                const enrolledIds = user ? await getEnrolledCourseIds() : [];
                setHasPurchased(enrolledIds.includes(courseId));

                const faqRes = await fetchApi.get<{ faqs: FAQ[] }>(
                    `api/courses/${courseId}/faqs`,
                    { requiresAuth: false },
                );
                setFaqs(faqRes.faqs || []);
            } catch (err) {
                const typedErr = err as FetchError;
                setError(typedErr.message || 'Failed to load course data.');
            }
        };

        fetchData();
    }, [courseId, user]); //

    return (
        <>

         <div
  className="w-full overflow-hidden relative  pb-28 -mt-[100px]"
  style={{
    backgroundColor: '#4A1B09',
    backgroundImage:
      'linear-gradient(to right, #1E0C05 0%, #4A1B09 30%, #AB4918 50%, #4A1B09 80%, #1E0C05 100%)',
  }}
>
           <div className="max-w-3xl mx-auto py-10 mt-24 px-4">
    {error && (
        <p className="text-red-500 p-50">Something went wrong!</p>
    )}
    <button
        onClick={() => router.back()}
        className="cursor-pointer bg-yellow-200 text-yellow-800 rounded-md px-2 py-2 flex items-center gap-2 hover:bg-yellow-800 hover:text-yellow-200 transition duration-200 shadow-md"
    >
        <FaChevronLeft
            className="inline font-semibold"
            size={16}
        />
        <span className="hidden md:block">Back</span>
    </button>
    <h1 className="font-bold text-yellow-200 text-2xl md:text-4xl text-center mb-2 my-16">
        {courseDetails?.title}
    </h1>

    <div className="mt-6">
        <p className="font-bold text-yellow-200 text-lg">Course Structure</p>
        <p className='text-yellow-200'>
            {courseDetails?.sections?.length} Sections –{' '}
            {courseDetails?.sections?.reduce(
                (total, section) =>
                    total + section.subSections.length,
                0,
            )}{' '}
            Subsections
        </p>
        {courseDetails?.totalFreeVideos && courseDetails.totalFreeVideos > 0 && (
            <p className="text-green-400 font-semibold mt-2">
                🎉 {courseDetails.totalFreeVideos} Free {courseDetails.totalFreeVideos === 1 ? 'Video' : 'Videos'} Available!
            </p>
        )}
    </div>

    {courseDetails?.sections?.map((section, sectionIndex) => {
        const freeSectionVideos = section.subSections.filter(sub => sub.is_free).length;
        
        return (
            <div key={section.id} className="mt-4">
                <div
                    onClick={() => toggleSection(section.id)}
                    className="bg-yellow-200 px-4 py-2 text-yellow-800 shadow-md flex justify-between items-center cursor-pointer border-2 border-yellow-200 rounded hover:shadow-yellow-200"
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
                    <FaChevronRight
                        size={20}
                        className={`transition-transform text-yellow-800 ${
                            openSections[section.id] ? 'rotate-90' : ''
                        }`}
                    />
                </div>

                <ul
                    className={`bg-yellow-200 transition-all ease-in-out ${
                        openSections[section.id]
                            ? 'max-h-96 opacity-100 overflow-y-auto'
                            : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                >
                    {section.subSections.map((sub, subIndex) => (
                        <li
                            key={sub.id || `${section.id}-${subIndex}`}
                            className="py-2 px-4 border-b border-yellow-200 flex text-yellow-800 justify-between items-center text-sm md:text-md hover:bg-yellow-800 hover:text-yellow-200"
                        >
                            <div className="flex-1 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <p className="line-clamp-2">
                                        {sectionIndex + 1}.{subIndex + 1}{' '}
                                        {sub.name}
                                        {sub.type === 'video' && (
                                            <span className="ml-2 text-gray-500">
                                                Duration:{' '}
                                                <span className="text-gray-800 font-semibold">
                                                    {sub.duration}
                                                </span>
                                            </span>
                                        )}
                                    </p>
                                    {sub.is_free && (
                                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                            FREE
                                        </span>
                                    )}
                                </div>
                                <div>
                                    {!sub.is_free && !hasPurchased && (
                                        <FaLock color="yellow-800" />
                                    )}
                                </div>
                            </div>

                            {sub.type === 'video' && (hasPurchased || sub.is_free) ? (
                                <span className="flex items-center gap-2 ml-4">
                                    <p className="hidden md:block font-semibold">
                                        Watch:
                                    </p>
                                    <FaVideo
                                        size={20}
                                        className="text-blue-600 cursor-pointer"
                                        onClick={() => {
                                            const videoUrl = hasPurchased 
                                                ? (sub.bunny_video_url || sub.file_url) 
                                                : (sub.youtube_video_url || sub.file_url);
                                            setSelectedVideoUrl(videoUrl || sub.file_url!);
                                        }}
                                    />
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>
        )
    })}
</div>

            {selectedVideoUrl && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
                    <div //className="bg-white p-4 rounded-lg w-[90%] max-w-4xl shadow-lg"
                    className="bg-white p-4 rounded-lg w-[90%] max-w-4xl shadow-lg"
                    >
                        <iframe
                            src={selectedVideoUrl}
                            className="w-full h-[500px] rounded"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <button
                            onClick={() => setSelectedVideoUrl(null)}
                            //className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
