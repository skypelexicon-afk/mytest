// lib/course.ts
export async function getCourseMetadata(id: string) {
  const res = await fetch(
    `https://tendingtoinfinityacademy.com/api/courses/unauth/${id}`,
    { cache: 'no-store' } // always fresh
  );

  if (!res.ok) throw new Error('Failed to fetch course metadata');

  const data = await res.json();

  return {
    title: data.modifiedCourse.title,
    description: data.modifiedCourse.description || 'Boost your skills 🚀',
    image: data.modifiedCourse.image,
    url: `https://tendingtoinfinityacademy.com/all-courses/explore/${id}`,
  };
}
