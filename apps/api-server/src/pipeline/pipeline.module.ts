import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { NewsModule } from '../news/news.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [NewsModule, SummaryModule],
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}
