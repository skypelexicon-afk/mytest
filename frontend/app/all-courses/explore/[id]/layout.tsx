// app/all-courses/explore/[id]/layout.tsx
import { Metadata, ResolvingMetadata } from 'next';
import { ReactNode } from 'react';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const { id } = await params;

    // fetch course info
    const data = await fetch(
        `https://tendingtoinfinityacademy.com/api/courses/unauth/${id}`,
        { cache: 'no-store' },
    ).then((res) => res.json());
    const course = data.course;
    const title = course.title;
    const description =
        course.description ||
        'Learn this course and boost your skills!';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/all-courses/explore/${id}`,
            images: [
                {
                    // url: `${process.env.NEXT_PUBLIC_SITE_URL}/all-courses/explore/${id}/opengraph-image`,
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/og/${id}?type=course`,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default function CourseLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
