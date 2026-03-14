import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post('run')
  runPipeline() {
    return this.pipelineService.runPipeline();
  }

  @Get('runs')
  findAllRuns() {
    return this.pipelineService.findAllRuns();
  }

  @Get('runs/:id')
  findRunById(@Param('id', ParseIntPipe) id: number) {
    return this.pipelineService.findRunById(id);
  }
}
