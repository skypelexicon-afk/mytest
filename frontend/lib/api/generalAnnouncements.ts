import { doFetch } from '../doFetch';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface GeneralAnnouncement {
  id: number;
  title: string;
  message: string;
  pinned: boolean;
  created_at: string;
}

export const getGeneralAnnouncements = async (
  page = 1,
  limit = 10
): Promise<{ announcements: GeneralAnnouncement[]; total: number }> => {
  const response = await doFetch<unknown,{ announcements: GeneralAnnouncement[]; total: number }>(
    `${API_BASE_URL}/api/general-announcements?page=${page}&limit=${limit}`
  );
  return response;
};
    