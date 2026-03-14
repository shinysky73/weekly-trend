import axios from 'axios';

export interface PipelineRun {
  id: number;
  status: string;
  totalNews: number;
  totalSummaries: number;
  errorLog: string | null;
  startedAt: string;
  completedAt: string | null;
}

export async function startPipeline(): Promise<{ id: number; status: string }> {
  const response = await axios.post<{ id: number; status: string }>('/pipeline/run');
  return response.data;
}

export async function fetchPipelineRuns(): Promise<PipelineRun[]> {
  const response = await axios.get<PipelineRun[]>('/pipeline/runs');
  return response.data;
}
