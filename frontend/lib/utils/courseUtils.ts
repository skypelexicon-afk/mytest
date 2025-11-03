export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || '₹';

export const calculateRating = (course: {
  courseRatings: { rating: number }[];
}): number => {
  if (!course.courseRatings || course.courseRatings.length === 0) {
    return 0;
  }

  const total = course.courseRatings.reduce((sum, r) => sum + r.rating, 0);
  return Math.floor(total / course.courseRatings.length);
};
