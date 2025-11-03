import { fetchApi } from '@/lib/doFetch';

export interface ProgressResponse {
  success: boolean;
  completedSubsections: number[];
  totalSubsections: number;
  completedCount: number;
  percentage: number;
}

export interface ToggleResponse {
  success: boolean;
  message: string;
  isCompleted: boolean;
}

export interface AllProgressResponse {
  success: boolean;
  progress: Array<{
    id: number;
    user_id: number;
    subsection_id: number;
    is_completed: boolean;
    completed_at: string | null;
  }>;
}

// Toggle subsection completion status
export const toggleSubsectionCompletion = async (
  subsectionId: number
): Promise<ToggleResponse> => {
  try {
    const response = await fetchApi.post<{ subsectionId: number }, ToggleResponse>(
      'api/progress/toggle',
      { subsectionId },
      true
    );
    return response;
  } catch (error) {
    console.error('Error toggling subsection completion:', error);
    throw error;
  }
};

// Get progress for a specific course
export const getCourseProgress = async (
  courseId: number
): Promise<ProgressResponse> => {
  try {
    const response = await fetchApi.get<ProgressResponse>(
      `api/progress/course/${courseId}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Get progress for all courses
export const getAllCoursesProgress = async (): Promise<AllProgressResponse> => {
  try {
    const response = await fetchApi.get<AllProgressResponse>(
      'api/progress/all'
    );
    return response;
  } catch (error) {
    console.error('Error fetching all courses progress:', error);
    throw error;
  }
};
