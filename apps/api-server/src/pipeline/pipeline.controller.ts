import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PipelineService } from './pipeline.service';

@Controller('pipeline')
@UseGuards(AuthGuard('jwt'))
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post('run')
  startPipeline() {
    return this.pipelineService.startPipeline();
  }

  @Get('runs')
  findAllRuns(@Query() query: { page?: string; limit?: string }) {
    return this.pipelineService.findAllRuns(query);
  }

  @Get('runs/:id')
  findRunById(@Param('id', ParseIntPipe) id: number) {
    return this.pipelineService.findRunById(id);
  }

  @Delete('runs/:id')
  deleteRun(@Param('id', ParseIntPipe) id: number) {
    return this.pipelineService.deleteRun(id);
  }
}
