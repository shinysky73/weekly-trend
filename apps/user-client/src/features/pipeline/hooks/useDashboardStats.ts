import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface DashboardStats {
  totalNews: number;
  totalSummaries: number;
  categoryCount: number;
  keywordCount: number;
  newsletterSendCount: number;
  lastSendDate: string | null;
  recentNewsThisWeek: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await axios.get<DashboardStats>('/dashboard/stats');
  return data;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60, // 1 minute
  });
}
