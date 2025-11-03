export interface FAQ {
    question: string;
    answer: string;
}

export interface Course {
    id: number;
    description: string;
    educator?: {
        name: string;
        image: string;
        subject: string;
    }[];
    educator_id: number;
    created_at: string;
    updated_at: string;
    title: string;
    image: string;
    target: string;
    is_active: boolean;
    startDate: string;
    endDate: string;
    price: number;
    originalPrice: number;
    discountLabel: string | number | undefined;
    demoVideos: string[];
    contents: string[]; // what you will get
    faqs: FAQ[];
    educatorName: string;
    educatorImage: string;
    totalFreeVideos?: number;
}

export interface SubSection {
    id: number;
    subSectionId: number;
    name: string;
    file_url: string;
    bunny_video_url?: string;
    youtube_video_url?: string;
    duration: string;
    type: string;
    section_id: number;
    is_free?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Section {
    id: number;
    name: string;
    course_id: number;
    created_at: string;
    updated_at: string;
    subSections: SubSection[];
    freeVideosCount?: number;
}

// export interface FAQ {
//     id: number;
//     course_id: number;
//     educator_id: number;
//     question: string;
//     answer: string;
//     approved: boolean;
//     created_at: string;
//     updated_at: string;
// }

export interface CourseDetails {
    id: number;
    title: string;
    image: string;
    description: string;
    price: number;
    target: string;
    startDate: string;
    endDate: string;
    originalPrice: number;
    discountLabel: string;
    educator_id: number;

    educatorName: string;
    educatorImage: string;
    demoVideos: string[];

    contents: string[]; // what you will get
    created_at: string;
    updated_at: string;
    sections: Section[];
    faqs: FAQ[];
    totalFreeVideos?: number;
}

export interface GetCourseDetailsResponse {
    success: boolean;
    isPurchased: boolean;
    course: CourseDetails;
}
