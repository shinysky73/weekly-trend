import { useSettingsStore } from '../stores/settingsStore';

export function NewsletterSettings() {
  const {
    logoUrl, headerBgColor, badgeColor, footerText, fontFamily,
    setLogoUrl, setHeaderBgColor, setBadgeColor, setFooterText, setFontFamily,
  } = useSettingsStore();

  const inputClass = 'w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="space-y-5">
      {/* Logo URL */}
      <div>
        <label className={labelClass}>로고 URL</label>
        <input
          type="text"
          value={logoUrl ?? ''}
          onChange={(e) => setLogoUrl(e.target.value || null)}
          placeholder="https://example.com/logo.png"
          className={inputClass}
        />
      </div>

      {/* Header Background Color */}
      <div>
        <label className={labelClass}>헤더 배경색</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={headerBgColor}
            onChange={(e) => setHeaderBgColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={headerBgColor}
            onChange={(e) => setHeaderBgColor(e.target.value)}
            className={`flex-1 font-mono ${inputClass}`}
          />
        </div>
      </div>

      {/* Badge Color */}
      <div>
        <label className={labelClass}>카테고리 배지 색상</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={badgeColor}
            onChange={(e) => setBadgeColor(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={badgeColor}
            onChange={(e) => setBadgeColor(e.target.value)}
            className={`flex-1 font-mono ${inputClass}`}
          />
        </div>
      </div>

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
          <option value="Noto Sans, Arial, sans-serif">Noto Sans</option>
          <option value="Roboto, Arial, sans-serif">Roboto</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Noto Sans KR, sans-serif">Noto Sans KR</option>
        </select>
      </div>
    </div>
  );
}
