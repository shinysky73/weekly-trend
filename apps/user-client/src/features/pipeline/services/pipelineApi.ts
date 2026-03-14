import axios from 'axios';

export interface PipelineRun {
  id: number;
  status: string;
  totalNews: number;
  totalSummaries: number;
  processedKeywords: number;
  totalKeywords: number;
  currentKeyword: string | null;
  quotaExceeded: boolean;
  errorLog: string | null;
  startedAt: string;
  completedAt: string | null;
}

export async function startPipeline(): Promise<{ id: number; status: string }> {
  const response = await axios.post<{ id: number; status: string }>('/pipeline/run');
  return response.data;
}

export interface PipelineRunsResponse {
  data: PipelineRun[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchPipelineRuns(page = 1, limit = 10): Promise<PipelineRunsResponse> {
  const response = await axios.get<PipelineRunsResponse>('/pipeline/runs', {
    params: { page, limit },
  });
  return response.data;
}

export async function deletePipelineRun(id: number): Promise<void> {
  await axios.delete(`/pipeline/runs/${id}`);
}

export async function deleteNews(id: number): Promise<void> {
  await axios.delete(`/news/${id}`);
}
