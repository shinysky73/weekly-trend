import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly replyToAddress: string;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const smtpUser = configService.get<string>('SMTP_USER') ?? '';
    this.fromAddress = configService.get<string>('SMTP_FROM') ?? smtpUser;
    this.replyToAddress = configService.get<string>('SMTP_REPLY_TO') ?? this.fromAddress;

    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('SMTP_HOST') ?? 'smtp.gmail.com',
      port: parseInt(configService.get<string>('SMTP_PORT') ?? '587', 10),
      secure: false,
      auth: {
        user: smtpUser,
        pass: configService.get<string>('SMTP_PASS') ?? '',
      },
    });
  }

  async send(params: {
    html: string;
    subject: string;
    recipients: string[];
    pipelineRunId?: number;
  }) {
    const { html, subject, recipients, pipelineRunId } = params;

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        replyTo: this.replyToAddress,
        to: recipients.join(', '),
        subject,
        html,
      });

      const record = await this.prisma.newsletterSend.create({
        data: {
          subject,
          recipientCount: recipients.length,
          status: 'sent',
          pipelineRunId: pipelineRunId ?? null,
        },
      });

      this.logger.log(`뉴스레터 발송 성공: ${recipients.length}명, subject="${subject}"`);
      return record;
    } catch (error) {
      const record = await this.prisma.newsletterSend.create({
        data: {
          subject,
          recipientCount: recipients.length,
          status: 'failed',
          errorLog: (error as Error).message,
          pipelineRunId: pipelineRunId ?? null,
        },
      });

      this.logger.error(`뉴스레터 발송 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  async findAllSends() {
    return this.prisma.newsletterSend.findMany({
      orderBy: { sentAt: 'desc' },
    });
  }
}
