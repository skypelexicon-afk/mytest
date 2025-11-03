import { fetchApi } from '@/lib/doFetch';
import { Course as CourseType } from '@/lib/types/courseType';
import { Bundle } from '@/lib/types/bundleType';
import { CourseDetails } from '@/lib/types/courseType';

export interface PurchasedCourse {
  // If course
  course_id: number | null;
  course_title: string | null;
  course_image: string | null;
  // If bundle
  bundle_id: number | null;
  bundle_title: string | null;
  bundle_image: string | null;
  created_at: string;
  order_id: number;
}

export interface Enrollment {
  student_name: string;
  course_title: string;
  enrollment_date: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  cart_id: number;
  added_at: string;
  course: CourseType;
}

export const fetchStudentEnrollments = async (): Promise<Enrollment[]> => {
  try {
    const data = await fetchApi.get('api/users/my-enrollments/') as {
      enrollments: Enrollment[];
    };

    if (!Array.isArray(data.enrollments)) {
      console.error('Invalid enrollments data:', data);
      return [];
    }

    return data.enrollments;
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    return [];
  }
}

export const fetchCreatedCourses = async (): Promise<{ courses: CourseType[]; total: number }> => {
  try {
    const data = await fetchApi.get<{ courses: CourseType[] }>(
      'api/users/my-created-courses',
    );
    return {
      courses: data.courses,
      total: data.courses.length,
    };
  } catch (error) {
    console.error('Error fetching created courses count:', error);
    return { courses: [], total: 0 };
  }
};

export const getPurchasedCourses = async (): Promise<PurchasedCourse[]> => {
  const data = await fetchApi.get('api/users/my-orders/') as {
    orders: PurchasedCourse[];
  };

  if (!Array.isArray(data.orders)) {
    console.error('Invalid orders data:', data);
    return [];
  }

  return data.orders;
};

export const getAllCourses = async (): Promise<{ courses: CourseType[]; total: number }> => {
  try {
    const res = await fetchApi.get<{ courses: CourseType[] }>('api/courses/');
    return {
      courses: res.courses,
      total: res.courses.length,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error fetching courses';
    console.error('getAllCourses error:', errorMessage);
    throw new Error(errorMessage);
  }
};
export const getAllCoursesAdmin = async (): Promise<{ courses: CourseType[]; total: number }> => {
  try {
    const res = await fetchApi.get<{ courses: CourseType[] }>('api/courses/adminCourses');
    return {
      courses: res.courses,
      total: res.courses.length,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error fetching courses';
    console.error('getAllCourses error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const getEnrolledCourseIds = async (): Promise<number[]> => {
  const res = await fetchApi.get<{ courses: { id: number }[] }>(
    'api/users/my-courses/'
  );
  return res.courses.map((course) => course.id);
};

export const getEnrolledBundleIds = async (): Promise<number[]> => {
  const res = await fetchApi.get<{ orders: { bundle_id: number | null }[] }>(
    'api/users/my-orders/'
  );
  const allIds = res.orders.map((bundle) => { if (bundle.bundle_id !== null) return bundle.bundle_id });
  return allIds.filter((bundleId) => (bundleId !== undefined));
};

export const getCourseById = async (id: number): Promise<CourseType> => {
  const res: { course?: CourseType; modifiedCourse?: CourseType } =
    await fetchApi.get(`api/courses/${id}/`);

  return res.course || res.modifiedCourse!;
};

export const getAllBundles = async (): Promise<{ bundles: Bundle[]; total: number }> => {
  try {
    const res = await fetchApi.get<{ bundles: Bundle[] }>('api/bundle'); // adjust URL to your backend
    return {
      bundles: res.bundles,
      total: res.bundles.length,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error fetching bundles';
    console.error('getAllBundles error:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const getBundleById = async (id: number): Promise<Bundle> => {
  const res = await fetchApi.get<{ bundle: Bundle }>(`api/bundle/${id}/`);

  if (!res || !res.bundle) {
    throw new Error("Invalid bundle response");
  }

  return res.bundle;
}

export const getCourseDetails = async (id: number): Promise<CourseDetails> => {
  const res = await fetchApi.get<{ course?: CourseDetails; modifiedCourse?: CourseDetails }>(`api/courses/${id}/`);

  if (!res || (!res.course && !res.modifiedCourse)) {
    throw new Error("Invalid course details response");
  }

  return res.course || res.modifiedCourse!;
};
export const getCourseDetailsUnAuth = async (id: number): Promise<CourseDetails> => {
  const res = await fetchApi.get<{ course?: CourseDetails; modifiedCourse?: CourseDetails }>(`api/courses/unauth/${id}/`, { requiresAuth: false });

  if (!res || (!res.course && !res.modifiedCourse)) {
    throw new Error("Invalid course details response");
  }

  return res.course || res.modifiedCourse!;
};

export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const res = await fetchApi.get<{ cart: CartItem[] }>('api/cart/');
    return res.cart;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error fetching cart items';
    console.error('getCartItems error:', errorMessage);
    throw new Error(errorMessage);
  }
}

