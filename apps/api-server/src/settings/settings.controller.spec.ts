import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getSettings: jest.fn(),
            upsertSettings: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SettingsController);
    service = module.get(SettingsService);
    jest.clearAllMocks();
  });

  it('shouldReturnSettingsOnGet: GET /settings 정상 응답', async () => {
    const mockSettings = { resultsPerKeyword: 10, dateRestrict: 'w1' };
    (service.getSettings as jest.Mock).mockResolvedValue(mockSettings);

    const result = await controller.getSettings();

    expect(service.getSettings).toHaveBeenCalled();
    expect(result).toEqual(mockSettings);
  });

  it('shouldSaveSettingsOnPut: PUT /settings 설정 저장', async () => {
    const dto = { resultsPerKeyword: 5, headerBgColor: '#ff0000' };
    const saved = { id: 1, ...dto };
    (service.upsertSettings as jest.Mock).mockResolvedValue(saved);

    const result = await controller.updateSettings(dto);

    expect(service.upsertSettings).toHaveBeenCalledWith(dto);
    expect(result).toEqual(saved);
  });
});
