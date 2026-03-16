import { SETTINGS_DEFAULTS } from '../../settings/stores/settingsStore';
import type { AppSettings } from '../../settings/services/settingsApi';

export interface NewsletterItem {
  title: string;
  link: string;
  summaryText: string;
  publisher: string;
  publishedDate: string;
  thumbnailUrl: string | null;
  categoryName: string;
}

interface NewsletterOptions {
  runDate?: string;
  totalCollected?: number;
  template?: Partial<AppSettings>;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  AI: { bg: '#dbeafe', text: '#1d4ed8' },
  'Knowledge Data Platform': { bg: '#e0e7ff', text: '#4338ca' },
  'Enterprise Portal': { bg: '#ede9fe', text: '#6d28d9' },
  'Customer First Portal': { bg: '#FDF0CD', text: '#6E3C0A' },
  MES: { bg: '#d1fae5', text: '#065f46' },
};

const FALLBACK_COLORS = [
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#ffedd5', text: '#9a3412' },
  { bg: '#fef9c3', text: '#854d0e' },
  { bg: '#ccfbf1', text: '#115e59' },
  { bg: '#e0f2fe', text: '#075985' },
];

function getCategoryColor(name: string, index: number): { bg: string; text: string } {
  return CATEGORY_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function computeWeekPeriod(dateStr: string): { monday: string; friday: string; monthWeek: string } | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  // Get Monday of this week (ISO week: Monday=1)
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const fmt = (dt: Date) =>
    `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
  const fmtShort = (dt: Date) =>
    `${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;

  // Week number within the month (based on the run date)
  const weekNum = Math.ceil(d.getDate() / 7);
  const month = `${d.getMonth() + 1}월`;

  return {
    monday: fmt(monday),
    friday: fmtShort(friday),
    monthWeek: `${month} ${weekNum}주차`,
  };
}

function renderArticle(item: NewsletterItem, isLast: boolean): string {
  const borderBottom = isLast ? '' : 'border-bottom:1px solid #e2e8f0;';
  const thumbnailCell = item.thumbnailUrl
    ? `<td width="180" style="width:180px;vertical-align:top;padding:0">
        <img src="${escapeHtml(item.thumbnailUrl)}" alt="" width="180" height="180" style="width:180px;height:180px;object-fit:cover;display:block;border-radius:8px" />
      </td>`
    : '';
  const contentPadding = item.thumbnailUrl ? 'padding-left:32px;' : '';

  return `<tr>
  <td style="padding-top:16px;padding-bottom:16px">
    <table width="100%" style="border-spacing:0;${borderBottom}padding-bottom:16px">
      <tbody><tr>
        ${thumbnailCell}
        <td style="${contentPadding}vertical-align:top">
          <a href="${escapeHtml(item.link)}" style="color:#1e293b;text-decoration:none" target="_blank">
            <p style="font-size:20px;font-weight:700;color:#1e293b;margin:0;line-height:1.3">${escapeHtml(item.title)}</p>
          </a>
          <p style="font-size:13px;color:#475569;margin:10px 0 0;line-height:1.6">${escapeHtml(item.summaryText)}</p>
          <table width="100%" style="border-spacing:0;margin-top:12px;border-top:1px solid #f1f5f9;padding-top:12px">
            <tbody><tr>
              <td style="font-size:11px;color:#94a3b8;font-weight:500">${escapeHtml(item.publisher)} | ${escapeHtml(item.publishedDate)}</td>
              <td align="right">
                <a href="${escapeHtml(item.link)}" style="font-size:12px;font-weight:700;color:#4b5563;text-decoration:none" target="_blank">READ MORE →</a>
              </td>
            </tr></tbody>
          </table>
        </td>
      </tr></tbody>
    </table>
  </td>
</tr>`;
}

function renderCategory(categoryName: string, items: NewsletterItem[], colorIndex: number): string {
  const color = getCategoryColor(categoryName, colorIndex);
  const articles = items.map((item, i) => renderArticle(item, i === items.length - 1)).join('\n');

  return `<table width="100%" style="border-spacing:0;margin-bottom:24px">
  <tbody>
    <tr>
      <td style="padding-bottom:8px">
        <table style="border-spacing:0">
          <tbody><tr>
            <td style="background-color:${color.bg};padding:4px 16px;border-radius:8px">
              <p style="font-weight:700;font-size:15px;color:${color.text};margin:0;line-height:1.4;letter-spacing:-0.5px">${escapeHtml(categoryName)}</p>
            </td>
          </tr></tbody>
        </table>
      </td>
    </tr>
    ${articles}
  </tbody>
</table>`;
}

export function generateNewsletterHtml(
  items: NewsletterItem[],
  options: NewsletterOptions,
): string {
  const t = options.template;
  const footerText = t?.footerText ?? SETTINGS_DEFAULTS.footerText;
  const fontFamily = t?.fontFamily ?? SETTINGS_DEFAULTS.fontFamily;

  const period = options.runDate ? computeWeekPeriod(options.runDate) : null;

  const grouped = new Map<string, NewsletterItem[]>();
  for (const item of items) {
    const list = grouped.get(item.categoryName) ?? [];
    list.push(item);
    grouped.set(item.categoryName, list);
  }

  let colorIndex = 0;
  const categoryHtml = Array.from(grouped.entries())
    .map(([name, categoryItems]) => renderCategory(name, categoryItems, colorIndex++))
    .join('\n');

  const periodHtml = period
    ? `<table style="border-spacing:0">
        <tr>
          <td style="border-left:4px solid #60a5fa;padding-left:24px">
            <p style="font-size:30px;font-weight:300;color:white;margin:0;line-height:1.2;white-space:nowrap"><span style="font-weight:700">${period.monthWeek.split(' ')[0]}</span> ${period.monthWeek.split(' ').slice(1).join(' ')}</p>
            <p style="color:#bfdbfe;opacity:0.8;margin:4px 0 0;font-size:14px;white-space:nowrap">${period.monday} — ${period.friday}</p>
          </td>
        </tr>
      </table>`
    : '';

  // Build intro summary
  const totalCollected = options.totalCollected ?? items.length;
  const categoryNames = Array.from(grouped.keys()).join(', ');
  const llmModel = t?.llmModel ?? SETTINGS_DEFAULTS.llmModel;
  const dateRange = period ? `${period.monday.slice(5).replace('.', '/')} ~ ${period.friday.replace('.', '/')}` : '';
  const introText = totalCollected > 0
    ? `${dateRange ? `${dateRange}까지의 ` : ''}${categoryNames} 사업 관련 주요 기사입니다. 구글과 뉴스 사이트에서 수집된 총 ${totalCollected}개의 기사 중 핵심 기사들을 선별하여 공유드립니다. 요약은 ${llmModel}를 통해 작성되었습니다.`
    : '';

  const fontName = fontFamily.split(',')[0].trim();
  const fontImport = fontName === 'Noto Sans KR'
    ? `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700;900&display=swap');`
    : fontName === 'Noto Sans'
      ? `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100..900&display=swap');`
      : fontName !== 'Arial'
        ? `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@100..900&display=swap');`
        : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=750" />
  <title>서비스기획센터 주간동향</title>
  <style>
    ${fontImport}
    body { font-family: ${fontFamily}; margin: 0; padding: 0; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;color:#1e293b;">
  <table align="center" width="750" style="border-spacing:0;margin:0 auto;width:750px;background-color:#ffffff;">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:0;">
        <table width="100%" style="border-spacing:0;">
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" style="border-spacing:0;">
                <tr>
                  <td style="vertical-align:bottom;">
                    <p style="color:#bfdbfe;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;font-size:12px">Weekly Trends Report</p>
                    <p style="font-size:32px;font-weight:400;color:white;margin:0;line-height:1.2">
                      서비스기획센터<br/>
                      <span style="font-weight:700">주간동향</span>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    ${periodHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Intro Summary -->
    <tr>
      <td style="background-color:#ffffff;border-bottom:1px solid #e2e8f0;">
        <table width="100%" style="border-spacing:0;">
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#64748b;font-size:12px;margin:0;line-height:1.6">${escapeHtml(introText)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Main Content -->
    <tr>
      <td style="background-color:#ffffff;padding:30px 32px 0 32px;">
        ${categoryHtml}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color:#0f172a;padding:24px 32px;border-top:1px solid #1e293b;">
        <table width="100%" style="border-spacing:0;">
          <tr>
            <td style="vertical-align:middle;">
              <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-1px">VNTG</span>
            </td>
            <td style="vertical-align:middle;text-align:center;">
              <p style="font-size:12px;color:#94a3b8;margin:0">${escapeHtml(footerText)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
