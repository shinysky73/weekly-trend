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

  it('shouldFetchPipelineRuns: GET /pipeline/runs에 page, limit 쿼리 전달', async () => {
    const mockResponse = {
      data: [{ id: 2, status: 'completed' }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockedAxios.get.mockResolvedValue({ data: mockResponse });

    const result = await fetchPipelineRuns(1, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith('/pipeline/runs', {
      params: { page: 1, limit: 10 },
    });
    expect(result).toEqual(mockResponse);
  });

  it('shouldHandleConflictError: 파이프라인 이미 실행 중(409)일 때 에러 전파', async () => {
    const error = new Error('Request failed with status code 409');
    (error as any).response = { status: 409 };
    mockedAxios.post.mockRejectedValue(error);

    await expect(startPipeline()).rejects.toThrow('Request failed with status code 409');
  });
});
