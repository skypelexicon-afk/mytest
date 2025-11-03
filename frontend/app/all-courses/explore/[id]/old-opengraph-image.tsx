import Image from 'next/image';
import { ImageResponse } from 'next/og';

// Metadata
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/jpeg';

export default async function OGImage({ params }: { params: { id: string } }) {
    // Fetch course details from your API/DB
    const course = await fetch(
        `https://tendingtoinfinityacademy.com/api/courses/unauth/${Number(params.id)}`,
        { cache: 'no-store' },
    ).then((res) => res.json());

    // console.log(course);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)', // dark background
                    color: 'white',
                }}
            >
                {/* Image */}
                <img
                    src={course.modifiedCourse.image}
                    alt={course.modifiedCourse.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
        ),

        size,
    );
}
