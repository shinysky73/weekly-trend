import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchSettings, saveSettings } from './settingsApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('settingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldFetchSettings: GET /settings 호출 및 응답 반환', async () => {
    const mockSettings = { resultsPerKeyword: 10, dateRestrict: 'w1', headerBgColor: '#e3edff' };
    mockedAxios.get.mockResolvedValue({ data: mockSettings });

    const result = await fetchSettings();

    expect(mockedAxios.get).toHaveBeenCalledWith('/settings');
    expect(result).toEqual(mockSettings);
  });

  it('shouldSaveSettings: PUT /settings 호출 및 응답 반환', async () => {
    const updateData = { resultsPerKeyword: 5, headerBgColor: '#ff0000' };
    const saved = { id: 1, ...updateData };
    mockedAxios.put.mockResolvedValue({ data: saved });

    const result = await saveSettings(updateData);

    expect(mockedAxios.put).toHaveBeenCalledWith('/settings', updateData);
    expect(result).toEqual(saved);
  });
});
