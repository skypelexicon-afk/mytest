'use client';
import { fetchApi } from '@/lib/doFetch';
import { removeInlineStyles } from '@/lib/utils/cleanHtml';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GiPin } from "react-icons/gi";

interface Announcement {
    id: number;
    course_id: number;
    title: string;
    message: string;
    pinned: boolean;
    created_at: string;
    updated_at: string;
}


const CourseAnnouncements = () => {
    const { id } = useParams();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [error, setError] = useState<string>();
    const [message, setMessage] = useState<string>("No announcements yet.");

    useEffect(() => {
        if (!id) return; // wait for courseId

        async function fetchAnnouncements() {
            try {
                const data = await fetchApi.get<{ announcements: Announcement[] }>(`api/courses/${id}/announcement`);
                setAnnouncements(data.announcements);
            } catch (err) {
                setError('Failed to load announcements');
                setMessage('');
            }
        }
        fetchAnnouncements();
    }, [id]);

    return (
        <>
      

            <div className=' mt-24 text-red-600'>
                {error}
            </div>
            <div //className='flex flex-col justify-center items-center w-11/12'
             className='flex flex-col justify-center items-center w-full px-4 md:px-0'>

                {announcements.length > 0 && (
                    <div className="mt-4 w-full">
                        {announcements.map((ann) => (
                            <div key={ann.id} //className="mb-3 border-b border rounded p-4 bg-gray-50 mx-10
                            className="mb-3 border-b border rounded p-4 bg-yellow-800 text-yellow-200 mx-10">
                                <div className='flex justify-between'>
                                    <h4 className="font-semibold text-xl">{ann.title}</h4>
                                    {ann.pinned && <GiPin size={20} />}
                                </div>
                                <div
                                    className="my-4 style-links"
                                    dangerouslySetInnerHTML={{ __html: removeInlineStyles(ann.message) }}
                                />
                                <small className="block text-yellow-800 mt-1">{new Date(ann.created_at).toLocaleString()}</small>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {announcements.length === 0 && (
                <div className='m-4'>
                    {message}
                </div>
            )}
           
        </>
    )
}

export default CourseAnnouncements;