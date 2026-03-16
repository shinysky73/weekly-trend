import { useSettingsStore } from '../stores/settingsStore';
import { useState } from 'react';

export function CollectionSettings() {
  const {
    resultsPerKeyword, dateRestrict, newsSites, summaryMaxLength, llmModel,
    setResultsPerKeyword, setDateRestrict, setSummaryMaxLength, setLlmModel,
    addNewsSite, removeNewsSite,
  } = useSettingsStore();

  const [newSite, setNewSite] = useState('');

  const handleAddSite = () => {
    const site = newSite.trim();
    if (site) {
      addNewsSite(site);
      setNewSite('');
    }
  };

  const inputClass = 'w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="space-y-5">
      {/* Results per keyword */}
      <div>
        <label className={labelClass}>키워드당 수집 건수</label>
        <select
          value={resultsPerKeyword}
          onChange={(e) => setResultsPerKeyword(Number(e.target.value))}
          className={inputClass}
        >
          <option value={5}>5건</option>
          <option value={10}>10건</option>
          <option value={20}>20건</option>
        </select>
      </div>

      {/* Date restrict */}
      <div>
        <label className={labelClass}>검색 기간</label>
        <select
          value={dateRestrict}
          onChange={(e) => setDateRestrict(e.target.value)}
          className={inputClass}
        >
          <option value="d3">최근 3일</option>
          <option value="w1">최근 1주일</option>
          <option value="d14">최근 2주일</option>
        </select>
      </div>

      {/* Summary max length */}
      <div>
        <label className={labelClass}>요약 길이 (자)</label>
        <input
          type="number"
          min={100}
          max={500}
          step={50}
          value={summaryMaxLength}
          onChange={(e) => setSummaryMaxLength(Number(e.target.value))}
          className={inputClass}
        />
      </div>

      {/* LLM Model */}
      <div>
        <label className={labelClass}>LLM 모델</label>
        <select
          value={llmModel}
          onChange={(e) => setLlmModel(e.target.value)}
          className={inputClass}
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
        </select>
      </div>

      {/* News sites */}
      <div>
        <label className={labelClass}>뉴스 사이트 목록</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(newsSites ?? []).map((site) => (
            <span
              key={site}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {site}
              <button
                onClick={() => removeNewsSite(site)}
                className="text-gray-400 hover:text-red-500 ml-0.5"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
            placeholder="example.com"
            className={`flex-1 ${inputClass}`}
          />
          <button
            onClick={handleAddSite}
            disabled={!newSite.trim()}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
