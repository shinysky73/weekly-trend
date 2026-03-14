import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const mockSendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: mockSendMail,
    options: { auth: { user: 'test@example.com' } },
  }),
}));

describe('NewsletterService', () => {
  let service: NewsletterService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        {
          provide: PrismaService,
          useValue: {
            newsletterSend: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(''),
          },
        },
      ],
    }).compile();

    service = module.get(NewsletterService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('shouldSendEmailWithHtmlBody: HTML 본문과 제목을 포함하여 이메일 발송한다', async () => {
    mockSendMail.mockResolvedValue({ messageId: '123' });
    (prisma.newsletterSend.create as jest.Mock).mockResolvedValue({ id: 1, status: 'sent' });

    await service.send({
      html: '<h1>Test</h1>',
      subject: '주간동향',
      recipients: ['user@test.com'],
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: '<h1>Test</h1>',
        subject: '주간동향',
        to: 'user@test.com',
      }),
    );
  });

  it('shouldSendToMultipleRecipients: 여러 수신자에게 동시 발송한다', async () => {
    mockSendMail.mockResolvedValue({ messageId: '123' });
    (prisma.newsletterSend.create as jest.Mock).mockResolvedValue({ id: 1, status: 'sent' });

    await service.send({
      html: '<p>Hi</p>',
      subject: 'Test',
      recipients: ['a@test.com', 'b@test.com', 'c@test.com'],
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'a@test.com, b@test.com, c@test.com',
      }),
    );
  });

  it('shouldSaveNewsletterSendRecord: 발송 성공 시 DB에 이력을 저장한다', async () => {
    mockSendMail.mockResolvedValue({ messageId: '123' });
    (prisma.newsletterSend.create as jest.Mock).mockResolvedValue({ id: 1, status: 'sent' });

    await service.send({
      html: '<p>Test</p>',
      subject: '주간동향',
      recipients: ['a@test.com', 'b@test.com'],
      pipelineRunId: 5,
    });

    expect(prisma.newsletterSend.create).toHaveBeenCalledWith({
      data: {
        subject: '주간동향',
        recipientCount: 2,
        status: 'sent',
        pipelineRunId: 5,
      },
    });
  });

  it('shouldSaveFailedRecord: 발송 실패 시 DB에 status=failed로 이력을 저장한다', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP connection refused'));
    (prisma.newsletterSend.create as jest.Mock).mockResolvedValue({ id: 1, status: 'failed' });

    await expect(
      service.send({
        html: '<p>Test</p>',
        subject: 'Test',
        recipients: ['a@test.com'],
      }),
    ).rejects.toThrow('SMTP connection refused');

    expect(prisma.newsletterSend.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'failed',
        errorLog: 'SMTP connection refused',
      }),
    });
  });

  it('shouldThrowWhenSmtpFails: SMTP 연결 실패 시 적절한 에러를 던진다', async () => {
    mockSendMail.mockRejectedValue(new Error('Connection timeout'));
    (prisma.newsletterSend.create as jest.Mock).mockResolvedValue({ id: 1 });

    await expect(
      service.send({
        html: '<p>Test</p>',
        subject: 'Test',
        recipients: ['a@test.com'],
      }),
    ).rejects.toThrow('Connection timeout');
  });
});
