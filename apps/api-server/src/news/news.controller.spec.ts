import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let controller: NewsController;
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: {
            findNewsPaginated: jest.fn(),
            findNewsById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Phase 8: Controller HTTP 계층 — News', () => {
    it('shouldCallFindNewsPaginatedWithQuery: GET /news 요청 시 service.findNewsPaginated를 올바른 쿼리 파라미터로 호출한다', async () => {
      const query = { page: '1', limit: '10', categoryId: '1' };
      await controller.findNewsPaginated(query as any);
      expect(service.findNewsPaginated).toHaveBeenCalledWith(query);
    });

    it('shouldCallFindNewsById: GET /news/:id 요청 시 service.findNewsById를 호출한다', async () => {
      await controller.findNewsById(1);
      expect(service.findNewsById).toHaveBeenCalledWith(1);
    });
  });
});
