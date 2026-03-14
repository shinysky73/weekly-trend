import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { sendNewsletter, fetchSendHistory } from './newsletterSendApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('newsletterSendApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldSendNewsletter: POST /newsletter/send에 html, subject, recipients 전달', async () => {
    const mockResult = { id: 1, status: 'sent' };
    mockedAxios.post.mockResolvedValue({ data: mockResult });

    const result = await sendNewsletter({
      html: '<h1>Test</h1>',
      subject: '주간동향',
      recipients: ['a@test.com'],
      pipelineRunId: 5,
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/newsletter/send', {
      html: '<h1>Test</h1>',
      subject: '주간동향',
      recipients: ['a@test.com'],
      pipelineRunId: 5,
    });
    expect(result).toEqual(mockResult);
  });

  it('shouldFetchSendHistory: GET /newsletter/sends 요청하여 이력 반환', async () => {
    const mockHistory = [{ id: 1, subject: 'Test', status: 'sent' }];
    mockedAxios.get.mockResolvedValue({ data: mockHistory });

    const result = await fetchSendHistory();

    expect(mockedAxios.get).toHaveBeenCalledWith('/newsletter/sends');
    expect(result).toEqual(mockHistory);
  });
});
