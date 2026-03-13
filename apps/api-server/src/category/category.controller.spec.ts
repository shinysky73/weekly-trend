import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            createCategory: jest.fn(),
            findAllCategories: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            createKeyword: jest.fn(),
            findKeywordsByCategory: jest.fn(),
            deleteKeyword: jest.fn(),
            createFilterKeyword: jest.fn(),
            findFilterKeywordsByCategory: jest.fn(),
            deleteFilterKeyword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Phase 5: Controller HTTP 계층', () => {
    it('shouldCallCreateCategoryWithDto: POST /categories 요청 시 service.createCategory를 올바른 인자로 호출한다', async () => {
      const dto = { name: '인공지능' };
      await controller.createCategory(dto);
      expect(service.createCategory).toHaveBeenCalledWith(dto);
    });

    it('shouldCallFindAllCategories: GET /categories 요청 시 service.findAllCategories를 호출한다', async () => {
      await controller.findAllCategories();
      expect(service.findAllCategories).toHaveBeenCalled();
    });

    it('shouldCallUpdateCategoryWithIdAndDto: PATCH /categories/:id 요청 시 service.updateCategory를 호출한다', async () => {
      const dto = { name: '블록체인' };
      await controller.updateCategory(1, dto);
      expect(service.updateCategory).toHaveBeenCalledWith(1, dto);
    });

    it('shouldCallDeleteCategoryWithId: DELETE /categories/:id 요청 시 service.deleteCategory를 호출한다', async () => {
      await controller.deleteCategory(1);
      expect(service.deleteCategory).toHaveBeenCalledWith(1);
    });

    it('shouldCallCreateKeywordWithCategoryIdAndDto: POST /categories/:id/keywords 요청 시 service.createKeyword를 호출한다', async () => {
      const dto = { text: 'GPT' };
      await controller.createKeyword(1, dto);
      expect(service.createKeyword).toHaveBeenCalledWith(1, dto);
    });

    it('shouldCallFindKeywordsByCategoryId: GET /categories/:id/keywords 요청 시 service.findKeywordsByCategory를 호출한다', async () => {
      await controller.findKeywordsByCategory(1);
      expect(service.findKeywordsByCategory).toHaveBeenCalledWith(1);
    });

    it('shouldCallDeleteKeywordWithId: DELETE /keywords/:id 요청 시 service.deleteKeyword를 호출한다', async () => {
      await controller.deleteKeyword(1);
      expect(service.deleteKeyword).toHaveBeenCalledWith(1);
    });

    it('shouldCallCreateFilterKeyword: POST /categories/:id/filter-keywords 요청 시 service.createFilterKeyword를 호출한다', async () => {
      const dto = { text: '광고' };
      await controller.createFilterKeyword(1, dto);
      expect(service.createFilterKeyword).toHaveBeenCalledWith(1, dto);
    });

    it('shouldCallFindFilterKeywordsByCategoryId: GET /categories/:id/filter-keywords 요청 시 service.findFilterKeywordsByCategory를 호출한다', async () => {
      await controller.findFilterKeywordsByCategory(1);
      expect(service.findFilterKeywordsByCategory).toHaveBeenCalledWith(1);
    });

    it('shouldCallDeleteFilterKeywordWithId: DELETE /filter-keywords/:id 요청 시 service.deleteFilterKeyword를 호출한다', async () => {
      await controller.deleteFilterKeyword(1);
      expect(service.deleteFilterKeyword).toHaveBeenCalledWith(1);
    });
  });
});
