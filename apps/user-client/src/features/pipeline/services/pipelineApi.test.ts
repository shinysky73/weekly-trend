import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { startPipeline, fetchPipelineRuns } from './pipelineApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('pipelineApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldStartPipeline: POST /pipeline/run 요청', async () => {
    const mockResponse = { data: { id: 1, status: 'running' } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await startPipeline();

    expect(mockedAxios.post).toHaveBeenCalledWith('/pipeline/run');
    expect(result).toEqual({ id: 1, status: 'running' });
  });

  it('shouldFetchPipelineRuns: GET /pipeline/runs 요청', async () => {
    const mockRuns = [
      { id: 2, status: 'completed', totalNews: 10, totalSummaries: 5, errorLog: null, startedAt: '2026-03-14', completedAt: '2026-03-14' },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockRuns });

    const result = await fetchPipelineRuns();

    expect(mockedAxios.get).toHaveBeenCalledWith('/pipeline/runs');
    expect(result).toEqual(mockRuns);
  });

  it('shouldHandleConflictError: 파이프라인 이미 실행 중(409)일 때 에러 전파', async () => {
    const error = new Error('Request failed with status code 409');
    (error as any).response = { status: 409 };
    mockedAxios.post.mockRejectedValue(error);

    await expect(startPipeline()).rejects.toThrow('Request failed with status code 409');
  });
});
