export interface DashboardData {
    studentCount: number;
    educatorCount: number;
    totalAmount: number;
    bestEducator: {
        educatorId: number;
        educatorName: string;
        totalEnrollments: number;
    };
    studentDetails: {
        id: number;
        name: string;
        email: string;
        phone: number;
    }[];
    educatorDetails: {
        id: number;
        name: string;
        email: string;
        phone: string;
        createdCourses: [{ id: number, name: string }];
    }[];
}

export interface DashboardEnrollmentData {
    enrollments: [{
        course_id: number,
        course_title: string,
        educator_id: number,
        direct_count: number,
        bundle_count: number,
        total_amount: number,
        student_ids: number[]
    }];
    educatorStats: [{
        educator_id: number,
        total_income: number,
        total_enrollments: number,
        courses: [{ course_id: number, course_title: string }],
    }];
}