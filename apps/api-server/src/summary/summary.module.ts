import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SummaryService } from './summary.service';

@Module({
  imports: [ConfigModule],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
