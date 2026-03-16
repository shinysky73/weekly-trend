import { useSettingsStore } from '../stores/settingsStore';

export function NewsletterSettings() {
  const {
    footerText, fontFamily,
    setFooterText, setFontFamily,
  } = useSettingsStore();

  const inputClass = 'w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="space-y-5">
      {/* Footer Text */}
      <div>
        <label className={labelClass}>푸터 텍스트</label>
        <input
          type="text"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Font Family */}
      <div>
        <label className={labelClass}>폰트</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className={inputClass}
        >
          <option value="Noto Sans KR, sans-serif">Noto Sans KR</option>
          <option value="Noto Sans, Arial, sans-serif">Noto Sans</option>
          <option value="Roboto, Arial, sans-serif">Roboto</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
        </select>
      </div>
    </div>
  );
}
