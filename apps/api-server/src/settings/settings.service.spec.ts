import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService, SETTINGS_DEFAULTS } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: PrismaService;

  const mockPrisma = {
    appSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(SettingsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  // Phase 1: CRUD

  it('shouldReturnDefaultSettingsWhenNoneExists: DB에 설정이 없을 때 모든 기본값 반환', async () => {
    mockPrisma.appSettings.findFirst.mockResolvedValue(null);

    const result = await service.getSettings();

    expect(result.resultsPerKeyword).toBe(10);
    expect(result.dateRestrict).toBe('w1');
    expect(result.newsSites).toEqual(SETTINGS_DEFAULTS.newsSites);
    expect(result.summaryMaxLength).toBe(250);
    expect(result.llmModel).toBe('gemini-2.5-flash');
    expect(result.headerBgColor).toBe('#e3edff');
    expect(result.badgeColor).toBe('#0047FF');
  });

  it('shouldReturnExistingSettings: DB에 저장된 설정 조회', async () => {
    const existing = {
      id: 1,
      resultsPerKeyword: 5,
      dateRestrict: 'd3',
      newsSites: 'a.com,b.com',
      summaryMaxLength: 100,
      llmModel: 'gemini-2.0-pro',
      logoUrl: 'https://logo.png',
      headerBgColor: '#ff0000',
      badgeColor: '#00ff00',
      footerText: 'Custom',
      fontFamily: 'Arial',
      updatedAt: new Date(),
    };
    mockPrisma.appSettings.findFirst.mockResolvedValue(existing);

    const result = await service.getSettings();

    expect(result.resultsPerKeyword).toBe(5);
    expect(result.dateRestrict).toBe('d3');
    expect(result.newsSites).toEqual(['a.com', 'b.com']);
    expect(result.summaryMaxLength).toBe(100);
  });

  it('shouldCreateSettingsWhenNoneExists: 첫 저장 시 새 레코드 생성', async () => {
    mockPrisma.appSettings.findFirst.mockResolvedValue(null);
    mockPrisma.appSettings.create.mockResolvedValue({
      id: 1, resultsPerKeyword: 5, newsSites: 'a.com', dateRestrict: 'w1',
      summaryMaxLength: 250, llmModel: 'gemini-2.5-flash',
      logoUrl: null, headerBgColor: '#e3edff', badgeColor: '#0047FF',
      footerText: 'weekly-trend', fontFamily: 'Noto Sans, Arial, sans-serif',
      updatedAt: new Date(),
    });

    await service.upsertSettings({ resultsPerKeyword: 5 });

    expect(prisma.appSettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ resultsPerKeyword: 5 }),
    });
  });

  it('shouldUpdateExistingSettings: 기존 설정 업데이트', async () => {
    const existing = { id: 1 };
    mockPrisma.appSettings.findFirst.mockResolvedValue(existing);
    mockPrisma.appSettings.update.mockResolvedValue({
      ...existing, resultsPerKeyword: 20, newsSites: 'a.com',
      dateRestrict: 'w1', summaryMaxLength: 250, llmModel: 'gemini-2.5-flash',
      logoUrl: null, headerBgColor: '#e3edff', badgeColor: '#0047FF',
      footerText: 'weekly-trend', fontFamily: 'Noto Sans, Arial, sans-serif',
      updatedAt: new Date(),
    });

    await service.upsertSettings({ resultsPerKeyword: 20 });

    expect(prisma.appSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ resultsPerKeyword: 20 }),
    });
  });

  it('shouldMergePartialUpdate: 일부 필드만 전달 시 나머지 기존값 유지', async () => {
    const existing = { id: 1 };
    mockPrisma.appSettings.findFirst.mockResolvedValue(existing);
    mockPrisma.appSettings.update.mockResolvedValue({
      ...existing, footerText: 'New', newsSites: 'a.com',
      resultsPerKeyword: 10, dateRestrict: 'w1', summaryMaxLength: 250,
      llmModel: 'gemini-2.5-flash', logoUrl: null, headerBgColor: '#e3edff',
      badgeColor: '#0047FF', fontFamily: 'Noto Sans, Arial, sans-serif',
      updatedAt: new Date(),
    });

    await service.upsertSettings({ footerText: 'New' });

    const updateCall = (prisma.appSettings.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.footerText).toBe('New');
    expect(updateCall.data).not.toHaveProperty('resultsPerKeyword');
  });

  it('shouldParseNewsSitesToArray: 쉼표 구분 newsSites 문자열을 배열로 변환하여 반환', async () => {
    mockPrisma.appSettings.findFirst.mockResolvedValue({
      id: 1, newsSites: 'zdnet.co.kr,www.etnews.com,www.bloter.net',
      resultsPerKeyword: 10, dateRestrict: 'w1', summaryMaxLength: 250,
      llmModel: 'gemini-2.5-flash', logoUrl: null, headerBgColor: '#e3edff',
      badgeColor: '#0047FF', footerText: 'weekly-trend',
      fontFamily: 'Noto Sans, Arial, sans-serif', updatedAt: new Date(),
    });

    const result = await service.getSettings();

    expect(Array.isArray(result.newsSites)).toBe(true);
    expect(result.newsSites).toEqual(['zdnet.co.kr', 'www.etnews.com', 'www.bloter.net']);
  });

  it('shouldSerializeNewsSitesFromArray: 배열로 전달된 newsSites를 쉼표 구분 문자열로 저장', async () => {
    const existing = { id: 1 };
    mockPrisma.appSettings.findFirst.mockResolvedValue(existing);
    mockPrisma.appSettings.update.mockResolvedValue({
      ...existing, newsSites: 'a.com,b.com',
      resultsPerKeyword: 10, dateRestrict: 'w1', summaryMaxLength: 250,
      llmModel: 'gemini-2.5-flash', logoUrl: null, headerBgColor: '#e3edff',
      badgeColor: '#0047FF', footerText: 'weekly-trend',
      fontFamily: 'Noto Sans, Arial, sans-serif', updatedAt: new Date(),
    });

    await service.upsertSettings({ newsSites: ['a.com', 'b.com'] });

    const updateCall = (prisma.appSettings.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.newsSites).toBe('a.com,b.com');
  });
});
