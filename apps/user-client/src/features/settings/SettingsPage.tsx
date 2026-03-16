import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore, SETTINGS_DEFAULTS } from './stores/settingsStore';
import { fetchSettings, saveSettings } from './services/settingsApi';
import { CollectionSettings } from './components/CollectionSettings';
import { NewsletterSettings } from './components/NewsletterSettings';

type Tab = 'collection' | 'newsletter';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('collection');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const store = useSettingsStore();

  useEffect(() => {
    if (store.loaded) return;
    const controller = new AbortController();
    fetchSettings()
      .then((data) => {
        if (!controller.signal.aborted) store.loadFromServer(data);
      })
      .catch(() => {/* use defaults */});
    return () => controller.abort();
  }, [store.loaded, store.loadFromServer]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      const s = useSettingsStore.getState();
      const saved = await saveSettings({
        resultsPerKeyword: s.resultsPerKeyword,
        dateRestrict: s.dateRestrict,
        newsSites: s.newsSites,
        summaryMaxLength: s.summaryMaxLength,
        llmModel: s.llmModel,
        logoUrl: s.logoUrl,
        footerLogoUrl: s.footerLogoUrl,
        headerBgColor: s.headerBgColor,
        badgeColor: s.badgeColor,
        footerText: s.footerText,
        fontFamily: s.fontFamily,
      });
      store.loadFromServer(saved);
      setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  }, [store]);

  const handleReset = useCallback(() => {
    store.resetToDefaults();
    setMessage(null);
  }, [store]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'collection', label: '뉴스 수집' },
    { key: 'newsletter', label: '뉴스레터' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">설정</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setMessage(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'collection' ? <CollectionSettings /> : <NewsletterSettings />}

      {/* Message */}
      {message && (
        <div className={`mt-4 text-sm px-3 py-2 rounded ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          기본값 복원
        </button>
      </div>
    </div>
  );
}
