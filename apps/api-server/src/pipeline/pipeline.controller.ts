import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PipelineService } from './pipeline.service';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post('run')
  @UseGuards(AuthGuard('jwt'))
  startPipeline() {
    return this.pipelineService.startPipeline();
  }

  @Get('runs')
  @UseGuards(AuthGuard('jwt'))
  findAllRuns() {
    return this.pipelineService.findAllRuns();
  }

  @Get('runs/:id')
  @UseGuards(AuthGuard('jwt'))
  findRunById(@Param('id', ParseIntPipe) id: number) {
    return this.pipelineService.findRunById(id);
  }
}
