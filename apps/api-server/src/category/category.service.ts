import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { CreateFilterKeywordDto } from './dto/create-filter-keyword.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: { name: dto.name } });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`카테고리명 '${dto.name}'이(가) 이미 존재합니다.`);
      }
      throw error;
    }
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: { keywords: true, filterKeywords: true },
    });
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    await this.findCategoryOrThrow(id);
    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async deleteCategory(id: number) {
    await this.findCategoryOrThrow(id);
    return this.prisma.category.delete({ where: { id } });
  }

  // Keyword CRUD

  async createKeyword(categoryId: number, dto: CreateKeywordDto) {
    await this.findCategoryOrThrow(categoryId);
    try {
      return await this.prisma.keyword.create({
        data: { text: dto.text, categoryId },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`키워드 '${dto.text}'이(가) 이미 존재합니다.`);
      }
      throw error;
    }
  }

  async findKeywordsByCategory(categoryId: number) {
    return this.prisma.keyword.findMany({ where: { categoryId } });
  }

  async deleteKeyword(id: number) {
    return this.prisma.keyword.delete({ where: { id } });
  }

  // FilterKeyword CRUD

  async createFilterKeyword(categoryId: number, dto: CreateFilterKeywordDto) {
    await this.findCategoryOrThrow(categoryId);
    try {
      return await this.prisma.filterKeyword.create({
        data: { text: dto.text, categoryId },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(`제외 키워드 '${dto.text}'이(가) 이미 존재합니다.`);
      }
      throw error;
    }
  }

  async findFilterKeywordsByCategory(categoryId: number) {
    return this.prisma.filterKeyword.findMany({ where: { categoryId } });
  }

  async deleteFilterKeyword(id: number) {
    return this.prisma.filterKeyword.delete({ where: { id } });
  }

  private async findCategoryOrThrow(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`카테고리(id=${id})를 찾을 수 없습니다.`);
    }
    return category;
  }
}
