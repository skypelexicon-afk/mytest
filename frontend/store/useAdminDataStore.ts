import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
import { fetchApi } from '@/lib/doFetch';
import { DashboardEnrollmentData, DashboardData } from '@/lib/types/adminDataType';
import { Course } from '@/lib/types/courseType';

type AllCoursesAdmin = Course & {
    bundle_count: number;
    direct_count: number;
    total_amount: number;
};

interface DashboardStore {
    enrollmentData: DashboardEnrollmentData | null;
    dashboardData: DashboardData | null;
    allCourses: AllCoursesAdmin[];
    error: string | null;
    isLoading: boolean;
    fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    enrollmentData: null,
    dashboardData: null,
    allCourses: [],
    error: null,
    isLoading: false,
    fetchDashboardData: async () => {
        try {
            set({ isLoading: true, error: null });

            const enrollmentResult = await fetchApi.get<DashboardEnrollmentData>('api/users/admin-enrollments');
            const result = await fetchApi.get<DashboardData>('api/users/admin-data/');
            const coursesResult = await fetchApi.get<Course[]>('api/courses/adminCourses');
            // console.log('enrollmentResult:', enrollmentResult);
            // console.log('dashboardResult:', result);
            // console.log('coursesResult:', coursesResult);
            const mergedCourses = coursesResult.map((course) => {
                const enrollment = enrollmentResult.enrollments.find((enr) => enr.course_id === course.id);
                return {
                    ...course,
                    bundle_count: enrollment ? enrollment.bundle_count : 0,
                    direct_count: enrollment ? enrollment.direct_count : 0,
                    total_amount: enrollment ? enrollment.total_amount : 0,
                };
            });
            console.log('mergedCourses:', mergedCourses);

            set({
                enrollmentData: enrollmentResult,
                dashboardData: result,
                allCourses: mergedCourses,
                isLoading: false,
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to load dashboard data';
            set({ error: errorMessage, isLoading: false });
        }
    },
}));