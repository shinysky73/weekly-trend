import axios from 'axios';

export interface NewsItem {
  id: number;
  title: string;
  link: string;
  snippet: string | null;
  content: string | null;
  publisher: string | null;
  publishedDate: string | null;
  thumbnailUrl: string | null;
  keyword: string;
  categoryId: number;
  collectionType: string;
  pipelineRunId: number | null;
  createdAt: string;
}

export interface NewsPaginatedResponse {
  data: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FetchNewsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

export async function fetchNews(params: FetchNewsParams = {}): Promise<NewsPaginatedResponse> {
  const { page = 1, limit = 20, ...rest } = params;
  const response = await axios.get<NewsPaginatedResponse>('/news', {
    params: { page, limit, ...rest },
  });
  return response.data;
}

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await axios.get<Category[]>('/categories');
  return response.data;
}
