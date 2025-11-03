import Image from 'next/image';
import { ImageResponse } from 'next/og';

// Metadata
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/jpeg';

export default async function OGImage({ params }: { params: { id: string } }) {
    // Fetch bundle details from your API/DB
    const bundleDetails = await fetch(
        `https://tendingtoinfinityacademy.com/api/bundle/${Number(params.id)}`,
        { cache: 'no-store' },
    ).then((res) => res.json());

    // console.log(bundleDetails);

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)', // dark background
                    color: 'white',
                }}
            >
                <img
                    src={bundleDetails.bundle.hero_image}
                    alt={bundleDetails.bundle.title}
                    width={1800}
                    height={720}
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
