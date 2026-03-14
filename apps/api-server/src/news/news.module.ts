import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { GoogleSearchService } from './google-search.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, GoogleSearchService],
  exports: [NewsService, GoogleSearchService],
})
export class NewsModule {}
