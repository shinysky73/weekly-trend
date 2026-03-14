import { CATEGORY_BADGE_COLOR } from '../../../lib/constants';

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
  title: string;
  subtitle: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderContentItem(item: NewsletterItem): string {
  const thumbnailCell = item.thumbnailUrl
    ? `<td style="width: 140px; height: 140px; text-align: center; vertical-align: top;">
          <img style="width: 140px; height: 140px; object-fit: cover; object-position: center; display: block; overflow: hidden;" src="${escapeHtml(item.thumbnailUrl)}"/>
        </td>
        <td style="padding-left: 20px;">`
    : '<td>';

  const closeTd = '</td>';

  return `<tr>
  <td style="padding-top: 20px;">
    <table style="border-spacing: 0;">
      <tr>
        ${thumbnailCell}
          <a href="${escapeHtml(item.link)}" style="color: inherit; text-decoration: none;">
            <p style="font-size:16px;font-weight:600;color:black;margin:0">${escapeHtml(item.title)}</p>
          </a>
          <p style="font-size:14px;color:#000000;margin:14px 0 0;">${escapeHtml(item.summaryText)}</p>
          <p style="font-size:12px;color:#8e8e93;margin:9px 0 0;">${escapeHtml(item.publisher)} | ${escapeHtml(item.publishedDate)}</p>
        ${closeTd}
      </tr>
    </table>
  </td>
</tr>`;
}

function renderCategory(categoryName: string, items: NewsletterItem[]): string {
  const contents = items.map(renderContentItem).join('\n');

  return `<table width="100%" style="border-spacing: 0; margin-bottom: 15px;">
  <tr>
    <td style="background-color:${CATEGORY_BADGE_COLOR};padding:0.5em 1.7em;border-radius:10em;display:inline-flex;justify-content:center;align-items:center;">
      <p style="font-weight:600;font-size:1.5em;color:white;text-align:center;margin:5px 7px;line-height:1;">${escapeHtml(categoryName)}</p>
    </td>
  </tr>
  ${contents}
</table>`;
}

export function generateNewsletterHtml(
  items: NewsletterItem[],
  options: NewsletterOptions,
): string {
  const grouped = new Map<string, NewsletterItem[]>();
  for (const item of items) {
    const list = grouped.get(item.categoryName) ?? [];
    list.push(item);
    grouped.set(item.categoryName, list);
  }

  const categoryHtml = Array.from(grouped.entries())
    .map(([name, categoryItems]) => renderCategory(name, categoryItems))
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100..900&display=swap');
    body { font-family: 'Noto Sans', Arial, sans-serif; color: #333333; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
  <table align="center" width="100%" style="border-spacing: 0; margin: 0; padding: 0; background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <table width="600" style="border-spacing: 0; max-width: 600px; min-width: 600px; background-color: #f9fbff;">
          <tr>
            <td style="background-color: #e3edff; padding: 0;">
              <table width="100%" style="border-spacing: 0;">
                <tr>
                  <td style="padding: 16px 8px;">
                    <table>
                      <tr>
                        <td style="font-weight: 450; font-size:27px; padding:0 0 0 10px; color: black;">
                          ${escapeHtml(options.title)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 25px 0 21px;">
              <p style="color: #8e8e93; font-size: 11px; margin: 0;">${escapeHtml(options.subtitle)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px 0 30px;">
              ${categoryHtml}
            </td>
          </tr>
          <tr><td style="height: 40px;"></td></tr>
          <tr>
            <td style="background-color: #e3edff; padding: 16px 30px;">
              <table width="100%" style="border-spacing: 0;">
                <tr>
                  <td style="font-weight: 600; color: #5b89ff; font-size: 13px;">weekly-trend</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
