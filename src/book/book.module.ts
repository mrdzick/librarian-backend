import { Module } from '@nestjs/common';
import { BookService } from './services/book.service';
import { BookController } from './controllers/book.controller';

@Module({
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
