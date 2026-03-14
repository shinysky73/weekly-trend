import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';

@Controller('news')
@UseGuards(AuthGuard('jwt'))
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findNewsPaginated(@Query() query: NewsQueryDto) {
    return this.newsService.findNewsPaginated(query);
  }

  @Get(':id')
  findNewsById(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findNewsById(id);
  }
}
