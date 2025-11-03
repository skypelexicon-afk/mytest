// app/bundle/[id]/layout.tsx
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

    // fetch bundle info
    const bundle = await fetch(
        `https://tendingtoinfinityacademy.com/api/bundle/${id}`,
        { cache: 'no-store' },
    ).then((res) => res.json());

    const title = bundle.bundle.title;
    const description =
        bundle.bundle.description || 'Boost your skills with this bundle!';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/all-courses/exploreBundle/${id}`,
            images: [
                {
                    // url: `${process.env.NEXT_PUBLIC_SITE_URL}/all-courses/exploreBundle/${id}/opengraph-image`,
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/og/${id}?type=bundle`,
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
            images: [
                // `${process.env.NEXT_PUBLIC_SITE_URL}/all-courses/exploreBundle/${id}/opengraph-image`,
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/og/${id}?type=bundle`,
            ],
        },
    };
}

export default function BundleLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
