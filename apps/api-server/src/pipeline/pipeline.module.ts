import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { NewsModule } from '../news/news.module';
import { SummaryModule } from '../summary/summary.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [NewsModule, SummaryModule, SettingsModule],
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}
