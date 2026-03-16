import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore, SETTINGS_DEFAULTS } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults();
  });

  it('shouldHaveDefaultValues: 초기 상태가 모든 기본값과 일치', () => {
    const state = useSettingsStore.getState();

    expect(state.resultsPerKeyword).toBe(10);
    expect(state.dateRestrict).toBe('w1');
    expect(state.newsSites).toEqual(SETTINGS_DEFAULTS.newsSites);
    expect(state.summaryMaxLength).toBe(250);
    expect(state.llmModel).toBe('gemini-2.5-flash');
    expect(state.headerBgColor).toBe('#e3edff');
    expect(state.badgeColor).toBe('#0047FF');
    expect(state.loaded).toBe(false);
  });

  it('shouldUpdateCollectionSettings: 수집 설정 필드 변경', () => {
    useSettingsStore.getState().setResultsPerKeyword(5);
    useSettingsStore.getState().setDateRestrict('d3');
    useSettingsStore.getState().setSummaryMaxLength(100);
    useSettingsStore.getState().setLlmModel('gemini-2.0-pro');

    const state = useSettingsStore.getState();
    expect(state.resultsPerKeyword).toBe(5);
    expect(state.dateRestrict).toBe('d3');
    expect(state.summaryMaxLength).toBe(100);
    expect(state.llmModel).toBe('gemini-2.0-pro');
  });

  it('shouldUpdateNewsletterSettings: 뉴스레터 설정 필드 변경', () => {
    useSettingsStore.getState().setHeaderBgColor('#ff0000');
    useSettingsStore.getState().setBadgeColor('#00ff00');
    useSettingsStore.getState().setFooterText('Custom');
    useSettingsStore.getState().setLogoUrl('https://logo.png');
    useSettingsStore.getState().setFontFamily('Arial');

    const state = useSettingsStore.getState();
    expect(state.headerBgColor).toBe('#ff0000');
    expect(state.badgeColor).toBe('#00ff00');
    expect(state.footerText).toBe('Custom');
    expect(state.logoUrl).toBe('https://logo.png');
    expect(state.fontFamily).toBe('Arial');
  });

  it('shouldUpdateNewsSites: 사이트 추가/삭제', () => {
    useSettingsStore.getState().addNewsSite('new-site.com');
    expect(useSettingsStore.getState().newsSites).toContain('new-site.com');

    useSettingsStore.getState().removeNewsSite('zdnet.co.kr');
    expect(useSettingsStore.getState().newsSites).not.toContain('zdnet.co.kr');

    // Duplicate add should not create duplicates
    const before = useSettingsStore.getState().newsSites.length;
    useSettingsStore.getState().addNewsSite('new-site.com');
    expect(useSettingsStore.getState().newsSites.length).toBe(before);
  });

  it('shouldResetToDefaults: 기본값 복원', () => {
    useSettingsStore.getState().setResultsPerKeyword(5);
    useSettingsStore.getState().setHeaderBgColor('#ff0000');

    useSettingsStore.getState().resetToDefaults();

    const state = useSettingsStore.getState();
    expect(state.resultsPerKeyword).toBe(10);
    expect(state.headerBgColor).toBe('#e3edff');
    expect(state.loaded).toBe(false);
  });

  it('shouldLoadFromServer: 서버 데이터로 스토어 초기화', () => {
    const serverData = {
      id: 1,
      resultsPerKeyword: 5,
      dateRestrict: 'd3',
      newsSites: ['a.com'],
      summaryMaxLength: 100,
      llmModel: 'gemini-2.0-pro',
      logoUrl: 'https://logo.png',
      headerBgColor: '#aabbcc',
      badgeColor: '#ddeeff',
      footerText: 'Server',
      fontFamily: 'Roboto',
    };

    useSettingsStore.getState().loadFromServer(serverData);

    const state = useSettingsStore.getState();
    expect(state.resultsPerKeyword).toBe(5);
    expect(state.newsSites).toEqual(['a.com']);
    expect(state.headerBgColor).toBe('#aabbcc');
    expect(state.loaded).toBe(true);
  });
});
