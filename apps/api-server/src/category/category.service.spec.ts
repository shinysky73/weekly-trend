import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            keyword: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            filterKeyword: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Phase 1: Category CRUD 핵심 기능', () => {
    it('shouldCreateCategory: name을 받아 카테고리를 생성하고 id, name, createdAt을 반환한다', async () => {
      const mockCategory = { id: 1, name: '인공지능', createdAt: new Date(), updatedAt: new Date() };
      (prisma.category.create as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.createCategory({ name: '인공지능' });

      expect(prisma.category.create).toHaveBeenCalledWith({ data: { name: '인공지능' } });
      expect(result).toEqual(mockCategory);
    });

    it('shouldFindAllCategories: 전체 카테고리 목록을 keywords, filterKeywords 포함하여 반환한다', async () => {
      const mockCategories = [
        { id: 1, name: '인공지능', keywords: [], filterKeywords: [], createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);

      const result = await service.findAllCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: { keywords: true, filterKeywords: true },
      });
      expect(result).toEqual(mockCategories);
    });

    it('shouldReturnEmptyArrayWhenNoCategories: 카테고리가 없으면 빈 배열을 반환한다', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllCategories();

      expect(result).toEqual([]);
    });

    it('shouldUpdateCategoryName: id와 name을 받아 카테고리명을 수정한다', async () => {
      const mockCategory = { id: 1, name: '블록체인', updatedAt: new Date() };
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.category.update as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.updateCategory(1, { name: '블록체인' });

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: '블록체인' },
      });
      expect(result).toEqual(mockCategory);
    });

    it('shouldDeleteCategory: id를 받아 카테고리를 삭제한다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await service.deleteCategory(1);

      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('Phase 2: Category 유효성 검사 및 에러 처리', () => {
    it('shouldThrowConflictWhenDuplicateCategoryName: 중복 카테고리명 생성 시 409 ConflictException을 던진다', async () => {
      const prismaError = { code: 'P2002', meta: { target: ['name'] } };
      (prisma.category.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.createCategory({ name: '인공지능' })).rejects.toThrow(ConflictException);
    });

    it('shouldThrowConflictWhenUpdatingToDuplicateCategoryName: 수정 시 중복 카테고리명이면 409를 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      const prismaError = { code: 'P2002', meta: { target: ['name'] } };
      (prisma.category.update as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.updateCategory(1, { name: '중복' })).rejects.toThrow(ConflictException);
    });

    it('shouldThrowNotFoundWhenCategoryNotExists: 존재하지 않는 카테고리 수정 시 404 NotFoundException을 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateCategory(999, { name: '변경' })).rejects.toThrow(NotFoundException);
    });

    it('shouldThrowNotFoundWhenDeletingNonExistentCategory: 존재하지 않는 카테고리 삭제 시 404 NotFoundException을 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteCategory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Phase 3: Keyword CRUD + 에러 처리', () => {
    it('shouldCreateKeyword: categoryId와 text를 받아 키워드를 생성한다', async () => {
      const mockKeyword = { id: 1, text: 'GPT', categoryId: 1, createdAt: new Date() };
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.keyword.create as jest.Mock).mockResolvedValue(mockKeyword);

      const result = await service.createKeyword(1, { text: 'GPT' });

      expect(prisma.keyword.create).toHaveBeenCalledWith({
        data: { text: 'GPT', categoryId: 1 },
      });
      expect(result).toEqual(mockKeyword);
    });

    it('shouldFindKeywordsByCategory: 카테고리별 키워드 목록을 반환한다', async () => {
      const mockKeywords = [{ id: 1, text: 'GPT', categoryId: 1, createdAt: new Date() }];
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.keyword.findMany as jest.Mock).mockResolvedValue(mockKeywords);

      const result = await service.findKeywordsByCategory(1);

      expect(prisma.keyword.findMany).toHaveBeenCalledWith({ where: { categoryId: 1 } });
      expect(result).toEqual(mockKeywords);
    });

    it('shouldThrowNotFoundWhenFindKeywordsForNonExistentCategory: 존재하지 않는 카테고리의 키워드 조회 시 404를 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findKeywordsByCategory(999)).rejects.toThrow(NotFoundException);
    });

    it('shouldDeleteKeyword: id를 받아 키워드를 삭제한다', async () => {
      (prisma.keyword.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.keyword.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await service.deleteKeyword(1);

      expect(prisma.keyword.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('shouldThrowNotFoundWhenDeletingNonExistentKeyword: 존재하지 않는 키워드 삭제 시 404를 던진다', async () => {
      (prisma.keyword.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteKeyword(999)).rejects.toThrow(NotFoundException);
    });

    it('shouldThrowNotFoundWhenCategoryNotExistsOnKeywordCreate: 존재하지 않는 카테고리에 키워드 생성 시 404를 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createKeyword(999, { text: 'GPT' })).rejects.toThrow(NotFoundException);
    });

    it('shouldThrowConflictWhenDuplicateKeyword: 동일 카테고리 내 중복 키워드 생성 시 409를 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      const prismaError = { code: 'P2002', meta: { target: ['categoryId', 'text'] } };
      (prisma.keyword.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.createKeyword(1, { text: 'GPT' })).rejects.toThrow(ConflictException);
    });
  });

  describe('Phase 4: FilterKeyword CRUD + 에러 처리', () => {
    it('shouldCreateFilterKeyword: categoryId와 text를 받아 제외 키워드를 생성한다', async () => {
      const mockFilterKeyword = { id: 1, text: '광고', categoryId: 1, createdAt: new Date() };
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.filterKeyword.create as jest.Mock).mockResolvedValue(mockFilterKeyword);

      const result = await service.createFilterKeyword(1, { text: '광고' });

      expect(prisma.filterKeyword.create).toHaveBeenCalledWith({
        data: { text: '광고', categoryId: 1 },
      });
      expect(result).toEqual(mockFilterKeyword);
    });

    it('shouldFindFilterKeywordsByCategory: 카테고리별 제외 키워드 목록을 반환한다', async () => {
      const mockFilterKeywords = [{ id: 1, text: '광고', categoryId: 1, createdAt: new Date() }];
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.filterKeyword.findMany as jest.Mock).mockResolvedValue(mockFilterKeywords);

      const result = await service.findFilterKeywordsByCategory(1);

      expect(prisma.filterKeyword.findMany).toHaveBeenCalledWith({ where: { categoryId: 1 } });
      expect(result).toEqual(mockFilterKeywords);
    });

    it('shouldThrowNotFoundWhenFindFilterKeywordsForNonExistentCategory: 존재하지 않는 카테고리의 제외 키워드 조회 시 404를 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findFilterKeywordsByCategory(999)).rejects.toThrow(NotFoundException);
    });

    it('shouldDeleteFilterKeyword: id를 받아 제외 키워드를 삭제한다', async () => {
      (prisma.filterKeyword.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.filterKeyword.delete as jest.Mock).mockResolvedValue({ id: 1 });

      await service.deleteFilterKeyword(1);

      expect(prisma.filterKeyword.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('shouldThrowNotFoundWhenDeletingNonExistentFilterKeyword: 존재하지 않는 제외 키워드 삭제 시 404를 던진다', async () => {
      (prisma.filterKeyword.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteFilterKeyword(999)).rejects.toThrow(NotFoundException);
    });

    it('shouldThrowConflictWhenDuplicateFilterKeyword: 동일 카테고리 내 중복 제외 키워드 생성 시 409를 던진다', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      const prismaError = { code: 'P2002', meta: { target: ['categoryId', 'text'] } };
      (prisma.filterKeyword.create as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.createFilterKeyword(1, { text: '광고' })).rejects.toThrow(ConflictException);
    });
  });
});
