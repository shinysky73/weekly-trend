import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsletterService } from './newsletter.service';
import { SendNewsletterDto } from './dto/send-newsletter.dto';

@Controller('newsletter')
@UseGuards(AuthGuard('jwt'))
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('send')
  send(@Body() dto: SendNewsletterDto) {
    return this.newsletterService.send(dto);
  }

  @Get('sends')
  findAllSends() {
    return this.newsletterService.findAllSends();
  }
}
