import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

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

export const SETTINGS_DEFAULTS = {
  id: 0,
  resultsPerKeyword: 10,
  dateRestrict: 'w1',
  newsSites: DEFAULT_NEWS_SITES,
  summaryMaxLength: 250,
  llmModel: 'gemini-2.5-flash',
  logoUrl: null as string | null,
  headerBgColor: '#e3edff',
  badgeColor: '#0047FF',
  footerText: 'weekly-trend',
  fontFamily: 'Noto Sans, Arial, sans-serif',
};

export type AppSettingsResponse = typeof SETTINGS_DEFAULTS & { updatedAt?: Date };

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<AppSettingsResponse> {
    const row = await this.prisma.appSettings.findFirst();
    if (!row) {
      return { ...SETTINGS_DEFAULTS, updatedAt: new Date() };
    }
    return {
      ...row,
      newsSites: row.newsSites.split(',').filter(Boolean),
    };
  }

  async upsertSettings(dto: UpdateSettingsDto): Promise<AppSettingsResponse> {
    const existing = await this.prisma.appSettings.findFirst();

    // Convert newsSites array to comma-separated string for DB
    const { newsSites, ...rest } = dto;
    const dbData: Record<string, any> = { ...rest };
    if (newsSites) {
      dbData.newsSites = newsSites.join(',');
    }

    if (existing) {
      const updated = await this.prisma.appSettings.update({
        where: { id: existing.id },
        data: dbData,
      });
      return {
        ...updated,
        newsSites: updated.newsSites.split(',').filter(Boolean),
      };
    }

    const created = await this.prisma.appSettings.create({
      data: {
        resultsPerKeyword: dto.resultsPerKeyword ?? SETTINGS_DEFAULTS.resultsPerKeyword,
        dateRestrict: dto.dateRestrict ?? SETTINGS_DEFAULTS.dateRestrict,
        newsSites: dto.newsSites?.join(',') ?? DEFAULT_NEWS_SITES.join(','),
        summaryMaxLength: dto.summaryMaxLength ?? SETTINGS_DEFAULTS.summaryMaxLength,
        llmModel: dto.llmModel ?? SETTINGS_DEFAULTS.llmModel,
        logoUrl: dto.logoUrl ?? SETTINGS_DEFAULTS.logoUrl,
        headerBgColor: dto.headerBgColor ?? SETTINGS_DEFAULTS.headerBgColor,
        badgeColor: dto.badgeColor ?? SETTINGS_DEFAULTS.badgeColor,
        footerText: dto.footerText ?? SETTINGS_DEFAULTS.footerText,
        fontFamily: dto.fontFamily ?? SETTINGS_DEFAULTS.fontFamily,
      },
    });
    return {
      ...created,
      newsSites: created.newsSites.split(',').filter(Boolean),
    };
  }
}
