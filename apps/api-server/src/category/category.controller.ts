import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { CreateFilterKeywordDto } from './dto/create-filter-keyword.dto';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get('categories')
  findAllCategories() {
    return this.categoryService.findAllCategories();
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteCategory(id);
  }

  @Post('categories/:id/keywords')
  createKeyword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateKeywordDto,
  ) {
    return this.categoryService.createKeyword(id, dto);
  }

  @Get('categories/:id/keywords')
  findKeywordsByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findKeywordsByCategory(id);
  }

  @Delete('keywords/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteKeyword(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteKeyword(id);
  }

  @Post('categories/:id/filter-keywords')
  createFilterKeyword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateFilterKeywordDto,
  ) {
    return this.categoryService.createFilterKeyword(id, dto);
  }

  @Get('categories/:id/filter-keywords')
  findFilterKeywordsByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findFilterKeywordsByCategory(id);
  }

  @Delete('filter-keywords/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFilterKeyword(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.deleteFilterKeyword(id);
  }
}
