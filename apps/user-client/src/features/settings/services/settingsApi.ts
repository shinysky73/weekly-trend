import axios from 'axios';

export interface AppSettings {
  id?: number;
  // 뉴스 수집
  resultsPerKeyword: number;
  dateRestrict: string;
  newsSites: string[];
  summaryMaxLength: number;
  llmModel: string;
  // 뉴스레터 템플릿
  logoUrl: string;
  footerLogoUrl: string;
  headerBgColor: string;
  badgeColor: string;
  footerText: string;
  fontFamily: string;
}

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await axios.get<AppSettings>('/settings');
  return data;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const { data } = await axios.put<AppSettings>('/settings', settings);
  return data;
}
