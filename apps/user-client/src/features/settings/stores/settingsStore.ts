import { create } from 'zustand';
import type { AppSettings } from '../services/settingsApi';

const DEFAULT_NEWS_SITES = [
  'zdnet.co.kr',
  'www.etnews.com',
  'www.bloter.net',
  'www.mk.co.kr',
  'www.chosun.com',
  'www.hani.co.kr',
  'www.donga.com',
  'www.sedaily.com',
];

export const SETTINGS_DEFAULTS: AppSettings = {
  resultsPerKeyword: 10,
  dateRestrict: 'w1',
  newsSites: DEFAULT_NEWS_SITES,
  summaryMaxLength: 250,
  llmModel: 'gemini-2.5-flash',
  logoUrl: null,
  headerBgColor: '#e3edff',
  badgeColor: '#0047FF',
  footerText: 'weekly-trend',
  fontFamily: 'Noto Sans, Arial, sans-serif',
};

interface SettingsState extends AppSettings {
  loaded: boolean;
  // Collection settings
  setResultsPerKeyword: (v: number) => void;
  setDateRestrict: (v: string) => void;
  setSummaryMaxLength: (v: number) => void;
  setLlmModel: (v: string) => void;
  addNewsSite: (site: string) => void;
  removeNewsSite: (site: string) => void;
  // Newsletter settings
  setHeaderBgColor: (color: string) => void;
  setBadgeColor: (color: string) => void;
  setFooterText: (text: string) => void;
  setLogoUrl: (url: string | null) => void;
  setFontFamily: (font: string) => void;
  // Actions
  resetToDefaults: () => void;
  loadFromServer: (settings: AppSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...SETTINGS_DEFAULTS,
  loaded: false,

  // Collection
  setResultsPerKeyword: (resultsPerKeyword) => set({ resultsPerKeyword }),
  setDateRestrict: (dateRestrict) => set({ dateRestrict }),
  setSummaryMaxLength: (summaryMaxLength) => set({ summaryMaxLength }),
  setLlmModel: (llmModel) => set({ llmModel }),
  addNewsSite: (site) =>
    set((state) => ({
      newsSites: state.newsSites.includes(site) ? state.newsSites : [...state.newsSites, site],
    })),
  removeNewsSite: (site) =>
    set((state) => ({
      newsSites: state.newsSites.filter((s) => s !== site),
    })),

  // Newsletter
  setHeaderBgColor: (headerBgColor) => set({ headerBgColor }),
  setBadgeColor: (badgeColor) => set({ badgeColor }),
  setFooterText: (footerText) => set({ footerText }),
  setLogoUrl: (logoUrl) => set({ logoUrl }),
  setFontFamily: (fontFamily) => set({ fontFamily }),

  // Actions
  resetToDefaults: () => set({ ...SETTINGS_DEFAULTS, loaded: false }),
  loadFromServer: (settings) =>
    set({
      resultsPerKeyword: settings.resultsPerKeyword ?? SETTINGS_DEFAULTS.resultsPerKeyword,
      dateRestrict: settings.dateRestrict ?? SETTINGS_DEFAULTS.dateRestrict,
      newsSites: settings.newsSites ?? SETTINGS_DEFAULTS.newsSites,
      summaryMaxLength: settings.summaryMaxLength ?? SETTINGS_DEFAULTS.summaryMaxLength,
      llmModel: settings.llmModel ?? SETTINGS_DEFAULTS.llmModel,
      logoUrl: settings.logoUrl ?? SETTINGS_DEFAULTS.logoUrl,
      headerBgColor: settings.headerBgColor ?? SETTINGS_DEFAULTS.headerBgColor,
      badgeColor: settings.badgeColor ?? SETTINGS_DEFAULTS.badgeColor,
      footerText: settings.footerText ?? SETTINGS_DEFAULTS.footerText,
      fontFamily: settings.fontFamily ?? SETTINGS_DEFAULTS.fontFamily,
      loaded: true,
    }),
}));
