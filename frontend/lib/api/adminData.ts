import { fetchApi } from '@/lib/doFetch';
import { DashboardData } from '@/lib/types/adminDataType';

export const fetchData = async (): Promise<DashboardData | null> => {
  try {
    const response = await fetchApi.get<DashboardData>('api/users/admin-data/');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
};
