import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Bundle } from '@/lib/types/bundleType';
import { Course } from '@/lib/types/courseType';
import { fetchApi } from '@/lib/doFetch';

interface CourseStore {
  selectedCourse: Course | null;
  courses: Course[];
  bundles: Bundle[];
  enrolledBundleIds: number[];
  isCoursesLoaded: boolean;
  isBundlesLoaded: boolean;
  isEnrolledBundlesLoaded: boolean;
  enrolledCourseIds: number[];
  isEnrolledCoursesLoaded: boolean;
  error: string | null;
  clearError: () => void;
  

  setCourse: (course: Course) => void;
  fetchCourses: () => Promise<void>;
  fetchBundles: () => Promise<void>;
  fetchEnrolledBundles: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  clearStore: () => void;
}

const storeCreator: StateCreator<CourseStore> = (set, get) => ({
  selectedCourse: null,
  courses: [],
  bundles: [],
  enrolledBundleIds: [],
  isCoursesLoaded: false,
  isBundlesLoaded: false,
  isEnrolledBundlesLoaded: false,
  enrolledCourseIds: [],
  isEnrolledCoursesLoaded: false,
  error: null,
  clearError: () => set({ error: null }),

  setCourse: (course) => set({ selectedCourse: course }),

  fetchCourses: async () => {
    if (get().isCoursesLoaded) return;
    try {
      const res = await fetchApi.get<{ courses: Course[] }>('api/courses/');
      set({ courses: res.courses, isCoursesLoaded: true });
    } catch (err) {
      set({ error: 'Error fetching courses' });
    }
  },

  fetchBundles: async () => {
    if (get().isBundlesLoaded) return;
    try {
      const res = await fetchApi.get<{ bundles: Bundle[] }>('api/bundle');
      set({ bundles: res.bundles, isBundlesLoaded: true });
    } catch (err) {
      set({ error: 'Error fetching bundles' });
    }
  },

  fetchEnrolledBundles: async () => {
    if (get().isEnrolledBundlesLoaded) return;
    try {
      const res = await fetchApi.get<{ orders: { bundle_id: number | null }[] }>(
        'api/users/my-orders/'
      );
      const ids = res.orders
        .map((order) => order.bundle_id)
        .filter((id): id is number => id !== null);
      set({ enrolledBundleIds: ids, isEnrolledBundlesLoaded: true });
    } catch (err) {
      set({ error: 'Error fetching enrolled bundles' });
    }
  },

  fetchEnrolledCourses: async () => {
    if (get().isEnrolledCoursesLoaded) return;
    try {
      const res = await fetchApi.get<{ courses: { id: number }[] }>(
        'api/users/my-courses/'
      );
      const ids = res.courses.map((course) => course.id);
      set({ enrolledCourseIds: ids, isEnrolledCoursesLoaded: true });
    } catch (err) {
      set({ error: 'Error fetching enrolled courses' });
    }
  },

  clearStore: () =>
    set({
      selectedCourse: null,
      courses: [],
      bundles: [],
      enrolledBundleIds: [],
      isCoursesLoaded: false,
      isBundlesLoaded: false,
      isEnrolledBundlesLoaded: false,
      isEnrolledCoursesLoaded: false,
      enrolledCourseIds: [],
    }),
});

//dev mode store with devtools
export const useCourseStore =
  process.env.NODE_ENV === 'development'
    ? create<CourseStore>()(devtools(storeCreator, { name: 'CourseStore' }))
    : create<CourseStore>()(storeCreator);
