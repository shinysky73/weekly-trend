import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: NewsletterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [
        {
          provide: NewsletterService,
          useValue: {
            send: jest.fn(),
            findAllSends: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(NewsletterController);
    service = module.get(NewsletterService);
  });

  it('shouldSendNewsletter: POST /newsletter/send 호출 시 서비스의 send 메서드를 호출한다', async () => {
    const dto = {
      html: '<h1>Test</h1>',
      subject: '주간동향',
      recipients: ['a@test.com'],
    };
    const mockResult = { id: 1, status: 'sent' };
    (service.send as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.send(dto);

    expect(service.send).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockResult);
  });

  it('shouldReturnSendHistory: GET /newsletter/sends 호출 시 발송 이력 목록을 반환한다', async () => {
    const mockHistory = [
      { id: 1, subject: 'Test', recipientCount: 3, status: 'sent', sentAt: '2026-03-14' },
    ];
    (service.findAllSends as jest.Mock).mockResolvedValue(mockHistory);

    const result = await controller.findAllSends();

    expect(service.findAllSends).toHaveBeenCalled();
    expect(result).toEqual(mockHistory);
  });

  it('shouldRejectEmptyRecipients: recipients가 빈 배열이면 class-validator 검증 실패', async () => {
    const { validate } = require('class-validator');
    const { SendNewsletterDto } = require('./dto/send-newsletter.dto');
    const dto = Object.assign(new SendNewsletterDto(), {
      html: '<p>Test</p>',
      subject: 'Test',
      recipients: [],
    });

    const errors = await validate(dto);
    const recipientsError = errors.find((e: any) => e.property === 'recipients');
    expect(recipientsError).toBeTruthy();
  });

  it('shouldRejectMissingHtml: html이 빈 문자열이면 class-validator 검증 실패', async () => {
    const { validate } = require('class-validator');
    const { SendNewsletterDto } = require('./dto/send-newsletter.dto');
    const dto = Object.assign(new SendNewsletterDto(), {
      html: '',
      subject: 'Test',
      recipients: ['a@test.com'],
    });

    const errors = await validate(dto);
    const htmlError = errors.find((e: any) => e.property === 'html');
    expect(htmlError).toBeTruthy();
  });
});
