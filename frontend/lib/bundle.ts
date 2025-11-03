// lib/bundle.ts
export async function getBundleMetadata(id: string) {
  const res = await fetch(`https://tendingtoinfinityacademy.com/api/bundle/${id}`, { cache: 'no-store' });
  const data = await res.json();
  return {
    title: data.bundle.title,
    description: data.bundle.description || 'Boost your skills 🚀',
    image: `https://tendingtoinfinityacademy.com/bundle/${id}/opengraph-image`,
  };
}
