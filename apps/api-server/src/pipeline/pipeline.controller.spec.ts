import { Test, TestingModule } from '@nestjs/testing';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';

describe('PipelineController', () => {
  let controller: PipelineController;
  let service: PipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelineController],
      providers: [
        {
          provide: PipelineService,
          useValue: {
            runPipeline: jest.fn(),
            findAllRuns: jest.fn(),
            findRunById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PipelineController>(PipelineController);
    service = module.get<PipelineService>(PipelineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Phase 9: Controller HTTP 계층 — Pipeline', () => {
    it('shouldCallRunPipeline: POST /pipeline/run 요청 시 service.runPipeline을 호출한다', async () => {
      await controller.runPipeline();
      expect(service.runPipeline).toHaveBeenCalled();
    });

    it('shouldCallFindAllPipelineRuns: GET /pipeline/runs 요청 시 service.findAllRuns를 호출한다', async () => {
      await controller.findAllRuns();
      expect(service.findAllRuns).toHaveBeenCalled();
    });

    it('shouldCallFindPipelineRunById: GET /pipeline/runs/:id 요청 시 service.findRunById를 호출한다', async () => {
      await controller.findRunById(1);
      expect(service.findRunById).toHaveBeenCalledWith(1);
    });
  });
});
